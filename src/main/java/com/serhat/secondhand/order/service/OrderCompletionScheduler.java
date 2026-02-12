package com.serhat.secondhand.order.service;

import com.serhat.secondhand.notification.service.INotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.Shipping;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCompletionScheduler {

    private final OrderRepository orderRepository;
    private final ShippingRepository shippingRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderEscrowService orderEscrowService;
    private final INotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    private static final int STATUS_UPDATE_INTERVAL_MINUTES = 5;
    private static final int COMPLETION_HOURS = 48;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    @Transactional
    public void autoUpdateOrderStatus() {
        log.info("Starting automatic order status update");

        LocalDateTime now = LocalDateTime.now();
        int updatedCount = 0;

        List<Order> confirmedOrders = orderRepository.findByStatusWithShipping(Order.OrderStatus.CONFIRMED);
        for (Order order : confirmedOrders) {
            if (shouldUpdateToProcessing(order, now)) {
                Order.OrderStatus oldStatus = order.getStatus();
                order.setStatus(Order.OrderStatus.PROCESSING);
                order.setUpdatedAt(now);
                orderRepository.save(order);
                sendStatusChangeNotification(order, oldStatus, Order.OrderStatus.PROCESSING);
                updatedCount++;
                log.info("Updated order {} status to PROCESSING", order.getOrderNumber());
            }
        }

        List<Order> processingOrders = orderRepository.findByStatusWithShipping(Order.OrderStatus.PROCESSING);
        log.debug("Found {} orders in PROCESSING status", processingOrders.size());
        for (Order order : processingOrders) {
            log.debug("Checking order {} for SHIPPED update. UpdatedAt: {}", order.getOrderNumber(), order.getUpdatedAt());
            if (shouldUpdateToShipped(order, now)) {
                Order.OrderStatus oldStatus = order.getStatus();
                order.setStatus(Order.OrderStatus.SHIPPED);
                order.setUpdatedAt(now);
                Shipping shipping = order.getShipping();
                if (shipping != null && shipping.getStatus() == ShippingStatus.PENDING) {
                    shipping.setStatus(ShippingStatus.IN_TRANSIT);
                    shipping.setInTransitAt(now);
                    shippingRepository.save(shipping);
                }
                orderRepository.save(order);
                sendStatusChangeNotification(order, oldStatus, Order.OrderStatus.SHIPPED);
                updatedCount++;
                log.info("Updated order {} status to SHIPPED (Shipping -> IN_TRANSIT)", order.getOrderNumber());
            }
        }

        List<Order> shippedOrders = orderRepository.findByStatusWithShipping(Order.OrderStatus.SHIPPED);
        for (Order order : shippedOrders) {
            if (shouldUpdateToDelivered(order, now)) {
                Order.OrderStatus oldStatus = order.getStatus();
                order.setStatus(Order.OrderStatus.DELIVERED);
                order.setUpdatedAt(now);
                Shipping shipping = order.getShipping();
                if (shipping != null && shipping.getStatus() == ShippingStatus.IN_TRANSIT) {
                    shipping.setStatus(ShippingStatus.DELIVERED);
                    shipping.setDeliveredAt(now);
                    shippingRepository.save(shipping);
                }
                orderRepository.save(order);
                sendStatusChangeNotification(order, oldStatus, Order.OrderStatus.DELIVERED);
                updatedCount++;
                log.info("Updated order {} status to DELIVERED (Shipping -> DELIVERED)", order.getOrderNumber());
            }
        }

        List<Order> deliveredOrders = orderRepository.findByStatusWithShipping(Order.OrderStatus.DELIVERED);
        for (Order order : deliveredOrders) {
            Shipping shipping = order.getShipping();
            if (shipping == null || shipping.getDeliveredAt() == null) {
                continue;
            }

            Duration duration = Duration.between(shipping.getDeliveredAt(), now);
            long hoursPassed = duration.toHours();

            if (hoursPassed >= COMPLETION_HOURS) {
                Order.OrderStatus oldStatus = order.getStatus();
                order.setStatus(Order.OrderStatus.COMPLETED);
                Order savedOrder = orderRepository.save(order);
                orderEscrowService.releaseEscrowsForOrder(savedOrder);
                orderNotificationService.sendOrderCompletionNotification(order.getUser(), savedOrder, true);
                sendStatusChangeNotification(savedOrder, oldStatus, Order.OrderStatus.COMPLETED);
                updatedCount++;
                log.info("Auto-completed order: {} ({} hours after delivery)", order.getOrderNumber(), hoursPassed);
            }
        }

        if (updatedCount > 0) {
            log.info("Auto-updated {} orders", updatedCount);
        } else {
            log.debug("No orders to auto-update");
        }
    }

    private boolean shouldUpdateToProcessing(Order order, LocalDateTime now) {
        if (order.getUpdatedAt() == null) {
            if (order.getCreatedAt() == null) {
                log.warn("Order {} has null createdAt and updatedAt", order.getOrderNumber());
                return false;
            }
            Duration duration = Duration.between(order.getCreatedAt(), now);
            long minutesPassed = duration.toMinutes();
            boolean shouldUpdate = minutesPassed >= STATUS_UPDATE_INTERVAL_MINUTES;
            if (!shouldUpdate) {
                log.debug("Order {} not ready for PROCESSING: {} minutes passed since creation (need {})", 
                        order.getOrderNumber(), minutesPassed, STATUS_UPDATE_INTERVAL_MINUTES);
            }
            return shouldUpdate;
        }
        Duration duration = Duration.between(order.getUpdatedAt(), now);
        long minutesPassed = duration.toMinutes();
        boolean shouldUpdate = minutesPassed >= STATUS_UPDATE_INTERVAL_MINUTES;
        if (!shouldUpdate) {
            log.debug("Order {} not ready for PROCESSING: {} minutes passed (need {})", 
                    order.getOrderNumber(), minutesPassed, STATUS_UPDATE_INTERVAL_MINUTES);
        }
        return shouldUpdate;
    }

    private boolean shouldUpdateToShipped(Order order, LocalDateTime now) {
        if (order.getUpdatedAt() == null) {
            log.warn("Order {} has null updatedAt, cannot update to SHIPPED", order.getOrderNumber());
            return false;
        }
        Duration duration = Duration.between(order.getUpdatedAt(), now);
        long minutesPassed = duration.toMinutes();
        boolean shouldUpdate = minutesPassed >= STATUS_UPDATE_INTERVAL_MINUTES;
        if (!shouldUpdate) {
            log.debug("Order {} not ready for SHIPPED: {} minutes passed (need {})", 
                    order.getOrderNumber(), minutesPassed, STATUS_UPDATE_INTERVAL_MINUTES);
        }
        return shouldUpdate;
    }

    private boolean shouldUpdateToDelivered(Order order, LocalDateTime now) {
        Shipping shipping = order.getShipping();
        if (shipping == null || shipping.getInTransitAt() == null) {
            if (order.getUpdatedAt() == null) {
                return false;
            }
            Duration duration = Duration.between(order.getUpdatedAt(), now);
            return duration.toMinutes() >= STATUS_UPDATE_INTERVAL_MINUTES;
        }
        Duration duration = Duration.between(shipping.getInTransitAt(), now);
        return duration.toMinutes() >= STATUS_UPDATE_INTERVAL_MINUTES;
    }

    private void sendStatusChangeNotification(Order order, Order.OrderStatus oldStatus, Order.OrderStatus newStatus) {
        var request = notificationTemplateCatalog.orderStatusChanged(
                order.getUser().getId(),
                order.getId(),
                order.getOrderNumber(),
                oldStatus != null ? oldStatus.name() : "",
                newStatus.name()
        );
        var notificationResult = notificationService.createAndSend(request);
        if (notificationResult.isError()) {
            log.error("Failed to create notification: {}", notificationResult.getMessage());
        }
    }

}


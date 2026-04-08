package com.serhat.secondhand.order.application;

import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.application.event.OrderStatusChangedEvent;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.Shipping;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.repository.ShippingRepository;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderCompletionScheduler {

    private final OrderRepository orderRepository;
    private final ShippingRepository shippingRepository;
    private final OrderEscrowService orderEscrowService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderLogService orderLog;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedRate = OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES * 60 * 1000L)
    @Transactional
    public void autoUpdateOrderStatus() {
        orderLog.logSchedulerStarted();

        LocalDateTime now = LocalDateTime.now();
        int updatedCount = 0;

        List<Order> confirmedOrders = orderRepository.findByStatusWithShipping(Order.OrderStatus.CONFIRMED);
        for (Order order : confirmedOrders) {
            if (shouldUpdateToProcessing(order, now)) {
                Order.OrderStatus oldStatus = order.getStatus();
                order.setStatus(Order.OrderStatus.PROCESSING);
                order.setUpdatedAt(now);
                orderRepository.save(order);
                eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), Order.OrderStatus.PROCESSING.name()));
                updatedCount++;
                orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "PROCESSING");
            }
        }

        List<Order> processingOrders = orderRepository.findByStatusWithShipping(Order.OrderStatus.PROCESSING);
        for (Order order : processingOrders) {
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
                eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), Order.OrderStatus.SHIPPED.name()));
                updatedCount++;
                orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "SHIPPED");
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
                eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), Order.OrderStatus.DELIVERED.name()));
                updatedCount++;
                orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "DELIVERED");
            }
        }

        List<Order> deliveredOrders = orderRepository.findByStatusWithShipping(Order.OrderStatus.DELIVERED);
        for (Order order : deliveredOrders) {
            Shipping shipping = order.getShipping();
            if (shipping == null || shipping.getDeliveredAt() == null) {
                continue;
            }
            if (shouldAutoCompleteOrder(shipping, now)) {
                Order.OrderStatus oldStatus = order.getStatus();
                order.setStatus(Order.OrderStatus.COMPLETED);
                Order savedOrder = orderRepository.save(order);

                var pendingEscrows = orderEscrowService.findPendingEscrowsByOrder(savedOrder);
                if (!pendingEscrows.isEmpty()) {
                    var orchestratorResult = paymentOrchestrator.releaseEscrowsToSellers(pendingEscrows);
                    if (orchestratorResult.isError()) {
                        orderLog.logEscrowReleaseFailed(savedOrder.getOrderNumber(), orchestratorResult.getMessage());
                    } else {
                        orderLog.logEscrowReleased(pendingEscrows.size(), savedOrder.getOrderNumber());
                    }
                }

                eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, savedOrder.getUser(), true));
                eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), Order.OrderStatus.COMPLETED.name()));
                updatedCount++;
                orderLog.logOrderCompleted(order.getOrderNumber(), true);
            }
        }

        orderLog.logSchedulerCompleted(updatedCount);
    }

    private boolean shouldUpdateToProcessing(Order order, LocalDateTime now) {
        if (order.getUpdatedAt() == null) {
            if (order.getCreatedAt() == null) {
                orderLog.logDataWarning("Order {} has null createdAt and updatedAt", order.getOrderNumber());
                return false;
            }
            Duration duration = Duration.between(order.getCreatedAt(), now);
            return duration.toMinutes() >= OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES;
        }
        Duration duration = Duration.between(order.getUpdatedAt(), now);
        return duration.toMinutes() >= OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES;
    }

    private boolean shouldUpdateToShipped(Order order, LocalDateTime now) {
        if (order.getUpdatedAt() == null) {
            orderLog.logDataWarning("Order {} has null updatedAt, cannot update to SHIPPED", order.getOrderNumber());
            return false;
        }
        Duration duration = Duration.between(order.getUpdatedAt(), now);
        return duration.toMinutes() >= OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES;
    }

    private boolean shouldUpdateToDelivered(Order order, LocalDateTime now) {
        Shipping shipping = order.getShipping();
        if (shipping == null || shipping.getInTransitAt() == null) {
            if (order.getUpdatedAt() == null) {
                return false;
            }
            Duration duration = Duration.between(order.getUpdatedAt(), now);
            return duration.toMinutes() >= OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES;
        }
        Duration duration = Duration.between(shipping.getInTransitAt(), now);
        return duration.toMinutes() >= OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES;
    }

    private boolean shouldAutoCompleteOrder(Shipping shipping, LocalDateTime now) {
        LocalDateTime deliveredAt = shipping.getDeliveredAt();
        if (deliveredAt == null) {
            return false;
        }
        Duration duration = Duration.between(deliveredAt, now);
        return duration.toHours() >= OrderBusinessConstants.AUTO_COMPLETION_HOURS;
    }

}


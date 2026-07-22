package com.serhat.secondhand.order.application;

import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.application.event.OrderStatusChangedEvent;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.repository.ShippingRepository;
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
    private final EscrowService escrowService;
    private final OrderLogService orderLog;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedRate = OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES * 60 * 1000L)
    @Transactional
    public void autoUpdateOrderStatus() {
        orderLog.logSchedulerStarted();

        LocalDateTime now = LocalDateTime.now();
        int updatedCount = 0;

        List<Order> confirmedOrders = orderRepository.findByStatusWithShipping(OrderStatus.CONFIRMED);
        for (Order order : confirmedOrders) {
            if (shouldUpdateToProcessing(order, now)) {
                OrderStatus oldStatus = order.getStatus();
                order.markAsProcessing();
                orderRepository.save(order);
                eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), OrderStatus.PROCESSING.name()));
                updatedCount++;
                orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "PROCESSING");
            }
        }

        List<Order> processingOrders = orderRepository.findByStatusWithShipping(OrderStatus.PROCESSING);
        for (Order order : processingOrders) {
            if (shouldUpdateToShipped(order, now)) {
                OrderStatus oldStatus = order.getStatus();
                // Simulation: Use ARAS carrier and a random tracking number
                String trackingNumber = "TRK" + System.currentTimeMillis();
                order.markAsShipped("ARAS", trackingNumber, null, "SIM-" + trackingNumber, null, java.math.BigDecimal.ZERO);
                orderRepository.save(order);
                eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), OrderStatus.SHIPPED.name()));
                updatedCount++;
                orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "SHIPPED (Tracking: " + trackingNumber + ")");
            }
        }

        List<Order> shippedOrders = orderRepository.findByStatusWithShipping(OrderStatus.SHIPPED);
        for (Order order : shippedOrders) {
            if (shouldUpdateToDelivered(order, now)) {
                OrderStatus oldStatus = order.getStatus();
                order.markAsDelivered();
                orderRepository.save(order);
                eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), OrderStatus.DELIVERED.name()));
                updatedCount++;
                orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "DELIVERED");
            }
        }

        List<Order> deliveredOrders = orderRepository.findByStatusWithShipping(OrderStatus.DELIVERED);
        for (Order order : deliveredOrders) {
            Shipping shipping = order.getShipping();
            if (shipping == null || shipping.getDeliveredAt() == null) {
                continue;
            }
            if (shouldAutoCompleteOrder(shipping, now)) {
                OrderStatus oldStatus = order.getStatus();

                // Release escrows first; only mark COMPLETED if release succeeds.
                var orchestratorResult = escrowService.release(order);
                if (orchestratorResult.isError()) {
                    continue; // skip completing this order; will retry on next scheduler run
                }

                order.applyCompletion();
                Order savedOrder = orderRepository.save(order);

                eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, savedOrder.getUser(), true));
                eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.COMPLETED.name()));
                updatedCount++;
                orderLog.logOrderCompleted(savedOrder.getOrderNumber(), true);
            }
        }

        List<Order> handoverConfirmedOrders = orderRepository.findByStatusWithShipping(OrderStatus.HANDOVER_CONFIRMED);
        for (Order order : handoverConfirmedOrders) {
            if (order.getDeliveryMethod() == com.serhat.secondhand.order.entity.enums.DeliveryMethod.SAFE_MEETUP && order.getMeetupVerifiedAt() != null) {
                Duration duration = Duration.between(order.getMeetupVerifiedAt(), now);
                if (duration.toHours() >= 24) {
                    OrderStatus oldStatus = order.getStatus();

                    // Release escrows first
                    var orchestratorResult = escrowService.release(order);
                    if (orchestratorResult.isError()) {
                        continue;
                    }

                    order.applyCompletion();
                    order.setCompletedByUser(null);
                    order.setCompletedAt(now);
                    Order savedOrder = orderRepository.save(order);

                    eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, savedOrder.getUser(), true));
                    eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.COMPLETED.name()));
                    updatedCount++;
                    orderLog.logOrderCompleted(savedOrder.getOrderNumber(), true);
                }
            }
        }

        List<Order> pendingMeetupOrders = orderRepository.findByStatusWithShipping(OrderStatus.MEETUP_PENDING);
        for (Order order : pendingMeetupOrders) {
            if (order.getDeliveryMethod() == com.serhat.secondhand.order.entity.enums.DeliveryMethod.SAFE_MEETUP) {
                Duration duration = Duration.between(order.getCreatedAt(), now);
                if (duration.toDays() >= 7) {
                    OrderStatus oldStatus = order.getStatus();

                    // Release/Refund escrow back to the buyer
                    var orchestratorResult = escrowService.cancel(order, order.getOrderItems());
                    if (orchestratorResult.isError()) {
                        continue;
                    }

                    order.setStatus(OrderStatus.CANCELLED);
                    order.setPaymentStatus(com.serhat.secondhand.payment.entity.PaymentStatus.REFUNDED);
                    Order savedOrder = orderRepository.save(order);

                    eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.CANCELLED.name()));
                    updatedCount++;
                    orderLog.logOrderCancelled(savedOrder.getOrderNumber(), false, "SYSTEM");
                }
            }
        }

        orderLog.logSchedulerCompleted(updatedCount);
    }

    private boolean shouldUpdateToProcessing(Order order, LocalDateTime now) {
        int interval = getEffectiveInterval(order);
        if (order.getUpdatedAt() == null) {
            if (order.getCreatedAt() == null) {
                orderLog.logDataWarning("Order {} has null createdAt and updatedAt", order.getOrderNumber());
                return false;
            }
            Duration duration = Duration.between(order.getCreatedAt(), now);
            return duration.toMinutes() >= interval;
        }
        Duration duration = Duration.between(order.getUpdatedAt(), now);
        return duration.toMinutes() >= interval;
    }

    private boolean shouldUpdateToShipped(Order order, LocalDateTime now) {
        if (order.getUpdatedAt() == null) {
            orderLog.logDataWarning("Order {} has null updatedAt, cannot update to SHIPPED", order.getOrderNumber());
            return false;
        }
        int interval = getEffectiveInterval(order);
        Duration duration = Duration.between(order.getUpdatedAt(), now);
        return duration.toMinutes() >= interval;
    }

    private boolean shouldUpdateToDelivered(Order order, LocalDateTime now) {
        Shipping shipping = order.getShipping();
        int interval = getEffectiveInterval(order);
        if (shipping == null || shipping.getInTransitAt() == null) {
            if (order.getUpdatedAt() == null) {
                return false;
            }
            Duration duration = Duration.between(order.getUpdatedAt(), now);
            return duration.toMinutes() >= interval;
        }
        Duration duration = Duration.between(shipping.getInTransitAt(), now);
        return duration.toMinutes() >= interval;
    }

    private int getEffectiveInterval(Order order) {
        int baseInterval = OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES;
        if (order.getUser() != null && order.getUser().isPremium()) {
            return baseInterval / 2;
        }
        return baseInterval;
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


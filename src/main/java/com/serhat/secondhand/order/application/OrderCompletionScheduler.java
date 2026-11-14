package com.serhat.secondhand.order.application;

import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.application.event.OrderStatusChangedEvent;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.BiPredicate;

/**
 * Advances orders by time thresholds.
 *
 * Each status step first asks the DB for the ids of orders that may be due (a coarse filter using the
 * shortest, premium interval), at most {@link #BATCH_SIZE} per step and run. Every order is then reloaded
 * and handled in its own transaction, where the exact rule is checked again: the status may have changed
 * since the id query, and a failure rolls back only that order. Orders left over are picked up next run.
 */
@Service
@Slf4j
public class OrderCompletionScheduler {

    static final int BATCH_SIZE = 200;
    private static final Pageable FIRST_BATCH = PageRequest.of(0, BATCH_SIZE);
    private static final int MIN_INTERVAL_MINUTES = OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES / 2;

    private final OrderRepository orderRepository;
    private final EscrowService escrowService;
    private final OrderCancellationService orderCancellationService;
    private final OrderLogService orderLog;
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;

    public OrderCompletionScheduler(OrderRepository orderRepository,
                                    EscrowService escrowService,
                                    OrderCancellationService orderCancellationService,
                                    OrderLogService orderLog,
                                    ApplicationEventPublisher eventPublisher,
                                    PlatformTransactionManager transactionManager) {
        this.orderRepository = orderRepository;
        this.escrowService = escrowService;
        this.orderCancellationService = orderCancellationService;
        this.orderLog = orderLog;
        this.eventPublisher = eventPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Scheduled(fixedRate = OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES * 60 * 1000L)
    @SchedulerLock(name = "orderCompletionScheduler", lockAtMostFor = "PT4M30S", lockAtLeastFor = "PT30S")
    public void autoUpdateOrderStatus() {
        orderLog.logSchedulerStarted();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime intervalCutoff = now.minusMinutes(MIN_INTERVAL_MINUTES);
        int updatedCount = 0;

        updatedCount += processEach(
                orderRepository.findIdsByStatusTouchedBefore(OrderStatus.CONFIRMED, intervalCutoff, FIRST_BATCH),
                OrderStatus.CONFIRMED, this::toProcessing, now);
        // Shipping is the seller's action (OrderShippingService); a paid cargo order left unshipped
        // past the deadline is cancelled and refunded to the buyer.
        LocalDateTime shipDeadline = now.minusHours(OrderBusinessConstants.SHIP_DEADLINE_HOURS);
        updatedCount += processEach(
                orderRepository.findIdsByStatusCreatedBefore(OrderStatus.CONFIRMED, DeliveryMethod.CARGO, shipDeadline, FIRST_BATCH),
                OrderStatus.CONFIRMED, this::cancelUnshipped, now);
        updatedCount += processEach(
                orderRepository.findIdsByStatusCreatedBefore(OrderStatus.PROCESSING, DeliveryMethod.CARGO, shipDeadline, FIRST_BATCH),
                OrderStatus.PROCESSING, this::cancelUnshipped, now);
        // Compensation sweep in case async BannedSellerOrderCancellationListener failed or was interrupted by a restart.
        updatedCount += processEach(
                orderRepository.findIdsOfRestrictedSellerOrders(
                        List.of(OrderStatus.CONFIRMED, OrderStatus.PROCESSING),
                        DeliveryMethod.CARGO,
                        AccountStatus.BLOCKED,
                        now,
                        FIRST_BATCH),
                null, this::cancelRestrictedSellerOrder, now);
        updatedCount += processEach(
                orderRepository.findIdsByStatusInTransitBefore(OrderStatus.SHIPPED, intervalCutoff, FIRST_BATCH),
                OrderStatus.SHIPPED, this::toDelivered, now);
        updatedCount += processEach(
                orderRepository.findIdsByStatusDeliveredBefore(OrderStatus.DELIVERED,
                        now.minusHours(OrderBusinessConstants.AUTO_COMPLETION_HOURS), FIRST_BATCH),
                OrderStatus.DELIVERED, this::autoComplete, now);
        updatedCount += processEach(
                orderRepository.findIdsByStatusMeetupVerifiedBefore(OrderStatus.HANDOVER_CONFIRMED,
                        DeliveryMethod.SAFE_MEETUP, now.minusHours(OrderBusinessConstants.MEETUP_AUTO_COMPLETION_HOURS), FIRST_BATCH),
                OrderStatus.HANDOVER_CONFIRMED, this::completeVerifiedMeetup, now);
        updatedCount += processEach(
                orderRepository.findIdsByStatusCreatedBefore(OrderStatus.MEETUP_PENDING,
                        DeliveryMethod.SAFE_MEETUP, now.minusDays(7), FIRST_BATCH),
                OrderStatus.MEETUP_PENDING, this::cancelStaleMeetup, now);

        orderLog.logSchedulerCompleted(updatedCount);
    }

    private int processEach(List<Long> orderIds, OrderStatus expectedStatus,
                            BiPredicate<Order, LocalDateTime> step, LocalDateTime now) {
        int updated = 0;
        for (Long orderId : orderIds) {
            try {
                Boolean changed = transactionTemplate.execute(tx -> orderRepository.findByIdWithShippingAndUser(orderId)
                        .filter(order -> expectedStatus == null || order.getStatus() == expectedStatus)
                        .map(order -> step.test(order, now))
                        .orElse(false));
                if (Boolean.TRUE.equals(changed)) {
                    updated++;
                }
            } catch (RuntimeException ex) {
                // Only this order's transaction is rolled back; it is retried on the next run.
                log.error("Order status scheduler failed for order {} in status {}", orderId, expectedStatus, ex);
            }
        }
        return updated;
    }

    // ── Steps: each runs inside the order's own transaction and returns whether the order changed ──

    private boolean toProcessing(Order order, LocalDateTime now) {
        if (!shouldUpdateToProcessing(order, now)) {
            return false;
        }
        OrderStatus oldStatus = order.getStatus();
        order.markAsProcessing();
        orderRepository.save(order);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), OrderStatus.PROCESSING.name()));
        orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "PROCESSING");
        return true;
    }

    private boolean cancelUnshipped(Order order, LocalDateTime now) {
        if (order.getDeliveryMethod() != DeliveryMethod.CARGO || order.getCreatedAt() == null
                || Duration.between(order.getCreatedAt(), now).toHours() < OrderBusinessConstants.SHIP_DEADLINE_HOURS) {
            return false;
        }
        var result = orderCancellationService.cancelUnshippedOrder(order.getId());
        if (result.isError()) {
            log.warn("Unshipped order {} could not be cancelled: {}", order.getOrderNumber(), result.getErrorCode());
            return false;
        }
        return true;
    }

    private boolean cancelRestrictedSellerOrder(Order order, LocalDateTime now) {
        if (order.getDeliveryMethod() != DeliveryMethod.CARGO
                || (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PROCESSING)) {
            return false;
        }
        var result = orderCancellationService.cancelForRestrictedSeller(order.getId());
        if (result.isError()) {
            log.warn("Restricted-seller order {} could not be cancelled: {}", order.getOrderNumber(), result.getErrorCode());
            return false;
        }
        return true;
    }

    private boolean toDelivered(Order order, LocalDateTime now) {
        if (!shouldUpdateToDelivered(order, now)) {
            return false;
        }
        OrderStatus oldStatus = order.getStatus();
        order.markAsDelivered();
        orderRepository.save(order);
        eventPublisher.publishEvent(new OrderStatusChangedEvent(order, oldStatus.name(), OrderStatus.DELIVERED.name()));
        orderLog.logStatusChanged(order.getOrderNumber(), oldStatus.name(), "DELIVERED");
        return true;
    }

    private boolean autoComplete(Order order, LocalDateTime now) {
        Shipping shipping = order.getShipping();
        if (shipping == null || !shouldAutoCompleteOrder(shipping, now)) {
            return false;
        }
        OrderStatus oldStatus = order.getStatus();

        // Release escrows first; only mark COMPLETED if release succeeds.
        var orchestratorResult = escrowService.release(order);
        if (orchestratorResult.isError()) {
            return false; // skip completing this order; will retry on next scheduler run
        }

        order.applyCompletion();
        Order savedOrder = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, savedOrder.getUser(), true));
        eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.COMPLETED.name()));
        orderLog.logOrderCompleted(savedOrder.getOrderNumber(), true);
        return true;
    }

    private boolean completeVerifiedMeetup(Order order, LocalDateTime now) {
        if (order.getDeliveryMethod() != DeliveryMethod.SAFE_MEETUP || order.getMeetupVerifiedAt() == null
                || Duration.between(order.getMeetupVerifiedAt(), now).toHours() < 24) {
            return false;
        }
        OrderStatus oldStatus = order.getStatus();

        // Release escrows first
        var orchestratorResult = escrowService.release(order);
        if (orchestratorResult.isError()) {
            return false;
        }

        order.applyCompletion();
        order.setCompletedByUser(null);
        order.setCompletedAt(now);
        Order savedOrder = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, savedOrder.getUser(), true));
        eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.COMPLETED.name()));
        orderLog.logOrderCompleted(savedOrder.getOrderNumber(), true);
        return true;
    }

    private boolean cancelStaleMeetup(Order order, LocalDateTime now) {
        if (order.getDeliveryMethod() != DeliveryMethod.SAFE_MEETUP
                || Duration.between(order.getCreatedAt(), now).toDays() < 7) {
            return false;
        }
        OrderStatus oldStatus = order.getStatus();

        // Release/Refund escrow back to the buyer
        var orchestratorResult = escrowService.cancel(order, order.getOrderItems());
        if (orchestratorResult.isError()) {
            return false;
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        Order savedOrder = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderStatusChangedEvent(savedOrder, oldStatus.name(), OrderStatus.CANCELLED.name()));
        orderLog.logOrderCancelled(savedOrder.getOrderNumber(), false, "SYSTEM");
        return true;
    }

    // ── Exact timing rules ──

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

    private boolean shouldAutoCompleteOrder(Shipping shipping, LocalDateTime now) {
        LocalDateTime deliveredAt = shipping.getDeliveredAt();
        if (deliveredAt == null) {
            return false;
        }
        Duration duration = Duration.between(deliveredAt, now);
        return duration.toHours() >= OrderBusinessConstants.AUTO_COMPLETION_HOURS;
    }

    private int getEffectiveInterval(Order order) {
        int baseInterval = OrderBusinessConstants.STATUS_UPDATE_INTERVAL_MINUTES;
        if (order.getUser() != null && order.getUser().isPremium()) {
            return baseInterval / 2;
        }
        return baseInterval;
    }
}

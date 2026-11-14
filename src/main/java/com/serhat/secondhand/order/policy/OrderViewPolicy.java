package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderAction;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

/**
 * Computes what a viewer may do with an order and when its time windows end. Every action is
 * derived from the same policy the matching endpoint enforces, so the frontend never re-implements
 * a status or time rule.
 */
@Component
@RequiredArgsConstructor
public class OrderViewPolicy {

    private final OrderCancellationPolicy cancellationPolicy;
    private final OrderRefundPolicy refundPolicy;
    private final OrderCompletionPolicy completionPolicy;
    private final OrderShippingPolicy shippingPolicy;

    public record View(Set<OrderAction> allowedActions,
                       LocalDateTime refundDeadline,
                       LocalDateTime shipDeadline,
                       LocalDateTime autoCompleteAt,
                       LocalDateTime meetupCodeExpiresAt) {
    }

    public View buyerView(Order order) {
        Set<OrderAction> actions = EnumSet.noneOf(OrderAction.class);
        OrderStatus status = order.getStatus();
        boolean meetup = order.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP;

        if (cancellationPolicy.validateCancellable(order).isSuccess()) actions.add(OrderAction.CANCEL);
        if (refundPolicy.validateRefundable(order).isSuccess()) actions.add(OrderAction.REFUND);
        if (completionPolicy.validateCompletable(order).isSuccess()) actions.add(OrderAction.COMPLETE);
        if (status.isModifiable()) actions.add(OrderAction.EDIT);
        if (order.isFulfilledForReview()) actions.add(OrderAction.REVIEW);
        if (meetup && status == OrderStatus.MEETUP_PENDING) actions.add(OrderAction.SHOW_MEETUP_CODE);
        if (meetup && completionPolicy.validateHandoverConfirmable(order, true).isSuccess()) {
            actions.add(OrderAction.CONFIRM_HANDOVER);
        }

        LocalDateTime meetupCodeExpiresAt = meetup && status == OrderStatus.MEETUP_PENDING
                ? plusMinutes(order.getMeetupVerificationCodeGeneratedAt(), OrderBusinessConstants.MEETUP_CODE_TTL_MINUTES)
                : null;
        LocalDateTime refundDeadline = status == OrderStatus.DELIVERED
                ? plusHours(deliveredAt(order), OrderBusinessConstants.REFUND_WINDOW_HOURS)
                : null;

        return new View(Set.copyOf(actions), refundDeadline, shipDeadline(order), autoCompleteAt(order), meetupCodeExpiresAt);
    }

    public View sellerView(Order order, Long sellerId) {
        Set<OrderAction> actions = EnumSet.noneOf(OrderAction.class);
        OrderStatus status = order.getStatus();
        boolean meetup = order.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP;

        if (shippingPolicy.validateShippable(order, sellerId).isSuccess()) actions.add(OrderAction.SHIP);
        if (meetup && status.isMeetupVerifiable()) actions.add(OrderAction.VERIFY_MEETUP);
        if (meetup && completionPolicy.validateHandoverConfirmable(order, false).isSuccess()) {
            actions.add(OrderAction.CONFIRM_HANDOVER);
        }

        return new View(Set.copyOf(actions), null, shipDeadline(order), autoCompleteAt(order), null);
    }

    /** End of the seller's shipping window; the scheduler cancels the order after it. */
    private LocalDateTime shipDeadline(Order order) {
        if (order.getDeliveryMethod() != DeliveryMethod.CARGO || !order.getStatus().isShippable()) {
            return null;
        }
        return plusHours(order.getCreatedAt(), OrderBusinessConstants.SHIP_DEADLINE_HOURS);
    }

    /** Earliest time the scheduler completes the order and releases escrow to the seller. */
    private LocalDateTime autoCompleteAt(Order order) {
        if (order.getStatus() == OrderStatus.DELIVERED) {
            return plusHours(deliveredAt(order), OrderBusinessConstants.AUTO_COMPLETION_HOURS);
        }
        if (order.getStatus() == OrderStatus.HANDOVER_CONFIRMED) {
            return plusHours(order.getMeetupVerifiedAt(), OrderBusinessConstants.MEETUP_AUTO_COMPLETION_HOURS);
        }
        return null;
    }

    private static LocalDateTime deliveredAt(Order order) {
        return order.getShipping() != null ? order.getShipping().getDeliveredAt() : null;
    }

    private static LocalDateTime plusHours(LocalDateTime start, int hours) {
        return start != null ? start.plusHours(hours) : null;
    }

    private static LocalDateTime plusMinutes(LocalDateTime start, int minutes) {
        return start != null ? start.plusMinutes(minutes) : null;
    }
}

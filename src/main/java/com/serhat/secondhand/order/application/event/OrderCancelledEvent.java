package com.serhat.secondhand.order.application.event;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;

import java.util.Objects;

/**
 * @param requester who cancelled; for a system cancellation the buyer, who is refunded
 * @param cause     why the order was cancelled
 */
public record OrderCancelledEvent(Order order, User requester, OrderCancellationCause cause) {

    public OrderCancelledEvent {
        Objects.requireNonNull(cause, "cause");
    }

    public OrderCancelledEvent(Order order, User requester) {
        this(order, requester, OrderCancellationCause.PARTICIPANT_REQUEST);
    }

    public OrderCancelledEvent(Order order, User requester, boolean shipDeadlineMissed) {
        this(order, requester, shipDeadlineMissed
                ? OrderCancellationCause.SHIP_DEADLINE_MISSED
                : OrderCancellationCause.PARTICIPANT_REQUEST);
    }

    public boolean shipDeadlineMissed() {
        return cause == OrderCancellationCause.SHIP_DEADLINE_MISSED;
    }
}

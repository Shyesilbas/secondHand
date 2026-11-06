package com.serhat.secondhand.order.application.event;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;

/**
 * @param requester          who cancelled; for a system cancellation the buyer, who is refunded
 * @param shipDeadlineMissed true when the system cancelled because the seller did not ship in time
 */
public record OrderCancelledEvent(Order order, User requester, boolean shipDeadlineMissed) {

    public OrderCancelledEvent(Order order, User requester) {
        this(order, requester, false);
    }
}

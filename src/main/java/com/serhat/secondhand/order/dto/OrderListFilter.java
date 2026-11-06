package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;

import java.util.EnumSet;
import java.util.Set;

/**
 * Optional filters for the buyer and seller order lists. Null fields mean "no filter".
 */
public record OrderListFilter(DeliveryMethod deliveryMethod, Set<OrderStatus> statuses, String orderNumber) {

    public static final OrderListFilter NONE = new OrderListFilter(null, null, null);

    public OrderListFilter {
        orderNumber = orderNumber == null || orderNumber.isBlank() ? null : orderNumber.trim();
    }

    /** JPQL {@code IN :statuses} cannot take an empty collection, so "no filter" becomes "every status". */
    public Set<OrderStatus> statusesOrAll() {
        return statuses == null || statuses.isEmpty() ? EnumSet.allOf(OrderStatus.class) : statuses;
    }
}

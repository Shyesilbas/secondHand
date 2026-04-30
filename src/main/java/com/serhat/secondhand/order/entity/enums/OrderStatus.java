package com.serhat.secondhand.order.entity.enums;

import lombok.Getter;

import java.util.EnumSet;
import java.util.Set;

@Getter
public enum OrderStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    PROCESSING("Processing"),
    SHIPPED("Shipped"),
    DELIVERED("Delivered"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    REFUNDED("Refunded");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Statuses in which an order can be cancelled by the buyer.
     */
    public static final Set<OrderStatus> CANCELLABLE_STATUSES =
            EnumSet.of(PENDING, CONFIRMED);

    /**
     * Statuses in which an order can be refunded by the buyer.
     */
    public static final Set<OrderStatus> REFUNDABLE_STATUSES =
            EnumSet.of(DELIVERED);

    /**
     * Statuses in which the order details (address, notes) can still be modified.
     */
    public static final Set<OrderStatus> MODIFIABLE_STATUSES =
            EnumSet.of(PENDING, CONFIRMED);

    /**
     * Statuses in which an order can be completed (buyer confirms receipt).
     */
    public static final Set<OrderStatus> COMPLETABLE_STATUSES =
            EnumSet.of(DELIVERED);

    public boolean isCancellable() {
        return CANCELLABLE_STATUSES.contains(this);
    }

    public boolean isRefundable() {
        return REFUNDABLE_STATUSES.contains(this);
    }

    public boolean isModifiable() {
        return MODIFIABLE_STATUSES.contains(this);
    }

    public boolean isCompletable() {
        return COMPLETABLE_STATUSES.contains(this);
    }
}

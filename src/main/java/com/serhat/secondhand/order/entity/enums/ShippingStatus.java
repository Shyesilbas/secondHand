package com.serhat.secondhand.order.entity.enums;

import lombok.Getter;

@Getter
public enum ShippingStatus {
    PENDING("Pending"),
    IN_TRANSIT("In Transit"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled");

    private final String label;

    ShippingStatus(String label) {
        this.label = label;
    }
}

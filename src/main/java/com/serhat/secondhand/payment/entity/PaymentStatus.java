package com.serhat.secondhand.payment.entity;

import lombok.Getter;

@Getter
public enum PaymentStatus {
    PENDING("Pending"),
    PAID("Paid"),
    ESCROW("In Escrow"),
    COMPLETED("Completed"),
    FAILED("Failed"),
    REFUNDED("Refunded"),
    PARTIALLY_REFUNDED("Partially Refunded"),
    DISPUTED("Disputed"),
    CANCELLED("Cancelled");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }
}

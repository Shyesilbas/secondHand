package com.serhat.secondhand.payment.entity;

import lombok.Getter;

@Getter
public enum PaymentType {
    CREDIT_CARD("Credit Card"),
    TRANSFER("Bank Transfer"),
    EWALLET("E-Wallet");

    private final String label;

    PaymentType(String label) {
        this.label = label;
    }
}

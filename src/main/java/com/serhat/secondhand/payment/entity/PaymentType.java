package com.serhat.secondhand.payment.entity;

import lombok.Getter;

@Getter
public enum PaymentType {
    EWALLET("E-Wallet");

    private final String label;

    PaymentType(String label) {
        this.label = label;
    }
}

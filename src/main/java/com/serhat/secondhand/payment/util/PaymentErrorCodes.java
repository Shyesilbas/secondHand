package com.serhat.secondhand.payment.util;

import lombok.Getter;

@Getter
public enum PaymentErrorCodes {
    NULL_RECIPIENT("NULL_RECIPIENT", "Recipient user must not be null for this transaction type"),
    INVALID_AMOUNT("INVALID_AMOUNT", "Payment amount must be greater than zero"),
    SELF_PAYMENT("SELF_PAYMENT", "Cannot make payment to yourself"),
    PAYMENT_TYPE_REQUIRED("PAYMENT_TYPE_REQUIRED", "Payment type is required"),
    UNSUPPORTED_PAYMENT_TYPE("UNSUPPORTED_PAYMENT_TYPE", "Unsupported payment type");

    private final String code;
    private final String message;

    PaymentErrorCodes(String code, String message) {
        this.code = code;
        this.message = message;
    }

}

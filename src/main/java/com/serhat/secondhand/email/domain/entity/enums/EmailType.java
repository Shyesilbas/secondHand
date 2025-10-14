package com.serhat.secondhand.email.domain.entity.enums;

import lombok.Getter;

@Getter
public enum EmailType {
    VERIFICATION_CODE("Verification Code"),
    PASSWORD_RESET("Password Reset"),
    WELCOME("Welcome"),
    NOTIFICATION("Notification"),
    PROMOTIONAL("Promotional"),
    PAYMENT_VERIFICATION("Payment Verification"),
    SYSTEM("System");

    private final String label;

    EmailType(String label) {
        this.label = label;
    }
}
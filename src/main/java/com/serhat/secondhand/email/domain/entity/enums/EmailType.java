package com.serhat.secondhand.email.domain.entity.enums;

import lombok.Getter;

@Getter
public enum EmailType {
    VERIFICATION_CODE("Verification Code"),
    PASSWORD_RESET("Password Reset"),
    WELCOME("Welcome"),
    NOTIFICATION("Notification"),
    OFFER_RECEIVED("Offer Received"),
    OFFER_COUNTER_RECEIVED("Offer Counter Received"),
    OFFER_ACCEPTED("Offer Accepted"),
    OFFER_REJECTED("Offer Rejected"),
    OFFER_EXPIRED("Offer Expired"),
    OFFER_COMPLETED("Offer Completed"),
    PROMOTIONAL("Promotional"),
    PAYMENT_VERIFICATION("Payment Verification"),
    SYSTEM("System");

    private final String label;

    EmailType(String label) {
        this.label = label;
    }
}
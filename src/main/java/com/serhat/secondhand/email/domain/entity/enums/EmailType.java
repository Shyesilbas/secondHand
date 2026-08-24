package com.serhat.secondhand.email.domain.entity.enums;

import lombok.Getter;

@Getter
public enum EmailType {
    VERIFICATION("Verification Code"),
    VERIFICATION_CODE("Verification Code"),
    PASSWORD_RESET("Password Reset"),
    WELCOME("Welcome"),
    PHONE_UPDATE("Phone Update"),
    NOTIFICATION("Notification"),
    OFFER_RECEIVED("Offer Received"),
    OFFER_COUNTER_RECEIVED("Offer Counter Received"),
    OFFER_ACCEPTED("Offer Accepted"),
    OFFER_REJECTED("Offer Rejected"),
    OFFER_EXPIRED("Offer Expired"),
    OFFER_COMPLETED("Offer Completed"),
    PROMOTIONAL("Promotional"),
    PAYMENT_VERIFICATION("Payment Verification"),
    PAYMENT_SUCCESS("Payment Receipt"),
    PAYMENT_RECEIPT("Payment Receipt"),
    NEW_LISTING("New Listing Notification"),
    NEW_LISTING_NOTIFICATION("New Listing Notification"),
    AGREEMENT_UPDATE("Agreement Updated"),
    AGREEMENT_UPDATED("Agreement Updated"),
    GREAT_SELLER("Great Seller Achievement"),
    GREAT_SELLER_ACHIEVEMENT("Great Seller Achievement"),
    SYSTEM("System"),
    ORDER_CONFIRMATION("Order Confirmation"),
    ORDER_CANCELLED("Order Cancelled"),
    ORDER_COMPLETED("Order Completed"),
    ORDER_REFUNDED("Order Refunded"),
    SALE_NOTIFICATION("Sale Notification"),
    SHIPPING_NOTIFICATION("Shipping Notification"),
    MEMBERSHIP_ACTIVATED("Membership Activated"),
    MEMBERSHIP_UPGRADE("Membership Activated"),
    MEMBERSHIP_EXPIRING("Membership Expiring"),
    PRICE_CHANGE("Price Change"),
    AUDIT_ALERT("Audit Alert"),
    ESCROW_RELEASED("Escrow Released"),
    LISTING_APPROVED("Listing Approved"),
    REVIEW_SUBMITTED("Review Submitted");

    private final String label;

    EmailType(String label) {
        this.label = label;
    }
}
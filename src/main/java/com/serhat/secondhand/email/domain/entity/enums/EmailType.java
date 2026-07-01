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
    NEW_LISTING_NOTIFICATION("New Listing Notification"),
    /** Yasal metin / sözleşme güncellemeleri — yalnızca gelen kutusu; in-app bildirim değil */
    AGREEMENT_UPDATED("Agreement Updated"),
    GREAT_SELLER_ACHIEVEMENT("Great Seller Achievement"),
    SYSTEM("System"),
    ORDER_CONFIRMATION("Order Confirmation"),
    PAYMENT_RECEIPT("Payment Receipt"),
    SHIPPING_NOTIFICATION("Shipping Notification"),
    MEMBERSHIP_ACTIVATED("Membership Activated"),
    MEMBERSHIP_EXPIRING("Membership Expiring"),
    ESCROW_RELEASED("Escrow Released"),
    LISTING_APPROVED("Listing Approved"),
    REVIEW_SUBMITTED("Review Submitted");

    private final String label;

    EmailType(String label) {
        this.label = label;
    }
}
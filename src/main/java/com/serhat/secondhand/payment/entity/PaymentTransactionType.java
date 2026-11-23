package com.serhat.secondhand.payment.entity;

public enum PaymentTransactionType {
    LISTING_CREATION,
    ITEM_PURCHASE,
    ITEM_SALE,
    REFUND,
    EWALLET_DEPOSIT,
    EWALLET_WITHDRAWAL,
    EWALLET_PAYMENT_RECEIVED,
    SHOWCASE_PAYMENT,
    MEMBERSHIP_PAYMENT,
    SHIPPING_FEE;

    /** Payments whose receiver is the platform system account, which is credited immediately. */
    public boolean isPlatformFee() {
        return this == LISTING_CREATION || this == SHOWCASE_PAYMENT || this == MEMBERSHIP_PAYMENT || this == SHIPPING_FEE;
    }
}
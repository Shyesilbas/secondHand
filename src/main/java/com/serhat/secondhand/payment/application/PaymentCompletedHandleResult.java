package com.serhat.secondhand.payment.application;

public record PaymentCompletedHandleResult(String listingTitle) {

    public static PaymentCompletedHandleResult empty() {
        return new PaymentCompletedHandleResult(null);
    }
}


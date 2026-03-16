package com.serhat.secondhand.payment.util;

public final class PaymentProcessingConstants {

    private PaymentProcessingConstants() {
    }

    public static final int MAX_OPTIMISTIC_LOCK_RETRIES = 3;
    public static final long BASE_RETRY_BACKOFF_MS = 50L;

    public static final double CREDIT_CARD_SIMULATION_SUCCESS_RATE = 0.95d;
    public static final String DEFAULT_CURRENCY = "TRY";
}

package com.serhat.secondhand.order.util;

public final class OrderBusinessConstants {

    private OrderBusinessConstants() {
    }

    public static final int REFUND_WINDOW_HOURS = 48;
    public static final int AUTO_COMPLETION_HOURS = 48;
    public static final int STATUS_UPDATE_INTERVAL_MINUTES = 5;

    public static final String ORDER_CURRENCY = "TRY";
    public static final String ORDER_NUMBER_PREFIX = "ORD-";

    public static final String EMAIL_SUBJECT_ORDER_CANCELLED = "SecondHand - Order Cancelled";
    public static final String EMAIL_SUBJECT_ORDER_REFUNDED = "SecondHand - Order Refunded";
    public static final String EMAIL_SUBJECT_ORDER_COMPLETED = "SecondHand - Order Completed";
}

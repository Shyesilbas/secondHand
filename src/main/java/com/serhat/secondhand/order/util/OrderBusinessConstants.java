package com.serhat.secondhand.order.util;

public final class OrderBusinessConstants {

    private OrderBusinessConstants() {
    }

    public static final int REFUND_WINDOW_HOURS = 48;
    public static final int AUTO_COMPLETION_HOURS = 72;
    public static final int STATUS_UPDATE_INTERVAL_MINUTES = 5;

    public static final String ORDER_CURRENCY = "TRY";
    public static final String ORDER_NUMBER_PREFIX = "ORD-";
}

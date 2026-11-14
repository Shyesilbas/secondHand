package com.serhat.secondhand.order.util;

public final class OrderBusinessConstants {

    private OrderBusinessConstants() {
    }

    public static final int REFUND_WINDOW_HOURS = 48;
    public static final int AUTO_COMPLETION_HOURS = 72;
    /** A paid cargo order the seller has not shipped within this many hours is cancelled and refunded. */
    public static final int SHIP_DEADLINE_HOURS = 72;
    public static final int STATUS_UPDATE_INTERVAL_MINUTES = 5;
    /** A Safe Meetup order is completed this many hours after the handover is confirmed. */
    public static final int MEETUP_AUTO_COMPLETION_HOURS = 24;
    /** A generated meetup OTP/QR code is accepted for this many minutes. */
    public static final int MEETUP_CODE_TTL_MINUTES = 5;

    public static final String ORDER_CURRENCY = "TRY";
    public static final String ORDER_NUMBER_PREFIX = "ORD-";
}

package com.serhat.secondhand.coupon.entity;

/**
 * WHO may use the coupon (not IDs for rule-based buckets).
 */
public enum CouponAudience {
    /** Anyone eligible by dates/limits (legacy {@code for_all_users = true}). */
    ALL_USERS,
    /** Only users listed in coupon_eligible_users. */
    USER_ID_LIST,
    /**
     * Buyers who have never completed a paid order ({@code payment_status = COMPLETED}).
     * Typically ORDER_FIXED ₺300, {@code usage_limit_per_user = 1}, no end date.
     */
    NEVER_ORDERED_FIRST_ORDER
}

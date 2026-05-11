package com.serhat.secondhand.user.domain.greatseller;

import java.math.BigDecimal;

/**
 * Canonical thresholds for Great Seller. UI copy mirrors these values in
 * {@code secondhand-frontend/src/home/components/greatSellerPolicyCopy.js}.
 */
public final class GreatSellerPolicy {

    public static final int ROLLING_WINDOW_DAYS = 60;
    public static final int MIN_QUALIFYING_SALES = 6;
    public static final BigDecimal MIN_UNIT_PRICE_TRY = new BigDecimal("1500");
    public static final int MIN_DISTINCT_REVIEWERS = 3;
    public static final double MIN_AVERAGE_RATING = 4.7d;

    private GreatSellerPolicy() {
    }
}

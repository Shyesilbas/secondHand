package com.serhat.secondhand.pricing.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PricingUtil {

    public static BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}


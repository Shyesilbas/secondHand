package com.serhat.secondhand.showcase.application;

import com.serhat.secondhand.core.config.ShowcaseConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Single source of showcase prices. It depends on configuration only, so the payment OTP e-mail
 * builder can use it without pulling in the payment pipeline.
 */
@Component
@RequiredArgsConstructor
public class ShowcasePricingCalculator {

    private static final BigDecimal PERCENT_DIVISOR = BigDecimal.valueOf(100);
    private static final int MONEY_SCALE = 2;

    private final ShowcaseConfig showcaseConfig;

    public BigDecimal dailyCost() {
        return showcaseConfig.getDaily().getCost();
    }

    public BigDecimal taxPercentage() {
        return showcaseConfig.getFee().getTax();
    }

    public BigDecimal dailyCostWithTax() {
        BigDecimal dailyCost = dailyCost();
        return dailyCost.multiply(taxPercentage())
                .divide(PERCENT_DIVISOR, MONEY_SCALE, RoundingMode.HALF_UP)
                .add(dailyCost);
    }

    /** What the user is charged for {@code days} days of one showcase. */
    public BigDecimal totalCost(int days) {
        return dailyCostWithTax().multiply(BigDecimal.valueOf(days));
    }

    public BigDecimal subtotal(int days) {
        return dailyCost().multiply(BigDecimal.valueOf(days));
    }

    /** Tax part of {@link #totalCost(int)}, derived from the charged total so the two always add up. */
    public BigDecimal taxAmount(int days) {
        return totalCost(days).subtract(subtotal(days));
    }

    public int maxDays() {
        return showcaseConfig.getMaxDays() != null ? showcaseConfig.getMaxDays() : 30;
    }
}

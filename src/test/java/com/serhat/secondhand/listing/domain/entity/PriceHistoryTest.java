package com.serhat.secondhand.listing.domain.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PriceHistoryTest {

    @Test
    void calculatePercentageChange_computesStandardAndLargeIncreases() {
        PriceHistory tenFoldIncrease = PriceHistory.builder()
                .oldPrice(new BigDecimal("100.00"))
                .newPrice(new BigDecimal("1500.00"))
                .build();
        tenFoldIncrease.calculatePercentageChange();

        assertEquals(new BigDecimal("1400.00"), tenFoldIncrease.getPercentageChange());
    }

    @Test
    void calculatePercentageChange_clampsWhenExceedingColumnPrecision() {
        PriceHistory extremeIncrease = PriceHistory.builder()
                .oldPrice(new BigDecimal("0.01"))
                .newPrice(new BigDecimal("50000000.00"))
                .build();
        extremeIncrease.calculatePercentageChange();

        assertEquals(new BigDecimal("99999999.99"), extremeIncrease.getPercentageChange());
    }
}


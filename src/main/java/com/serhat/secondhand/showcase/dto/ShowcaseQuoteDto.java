package com.serhat.secondhand.showcase.dto;

import java.math.BigDecimal;

/** Server-priced showcase cost for a duration plus the caller's balance check; the frontend shows it as-is. */
public record ShowcaseQuoteDto(
        int days,
        BigDecimal dailyCost,
        BigDecimal taxPercentage,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal totalCost,
        boolean sufficientBalance,
        BigDecimal balanceAfterPayment,
        BigDecimal shortfall) {
}

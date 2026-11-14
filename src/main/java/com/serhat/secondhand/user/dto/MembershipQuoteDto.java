package com.serhat.secondhand.user.dto;

import java.math.BigDecimal;

/** Server-priced premium upgrade plus the caller's balance check; the frontend shows it as-is. */
public record MembershipQuoteDto(
        BigDecimal price,
        int durationDays,
        boolean sufficientBalance,
        BigDecimal balanceAfterPayment,
        BigDecimal shortfall) {
}

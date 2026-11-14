package com.serhat.secondhand.payment.dto;

import java.math.BigDecimal;

/**
 * {@code GET /api/v1/listings/fee-quote}: the listing fee the backend will charge and whether the
 * viewer's eWallet covers it. The frontend gates the pay button on {@code sufficientBalance}.
 */
public record ListingFeeQuoteDto(BigDecimal totalFee, boolean sufficientBalance) {
}

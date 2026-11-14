package com.serhat.secondhand.ewallet.dto;

import java.math.BigDecimal;

/**
 * Server-side answer to "can this user pay this amount": the frontend shows these values and never
 * subtracts the amount from a balance itself.
 */
public record BalanceCheckDto(boolean sufficientBalance, BigDecimal balanceAfterPayment, BigDecimal shortfall) {
}

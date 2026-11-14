package com.serhat.secondhand.payment.dto;

import java.math.BigDecimal;

/** {@code GET /api/v1/payments/statistics}: the viewer's ledger totals; all amounts in TRY. */
public record PaymentStatisticsDto(
        long totalPayments,
        long successfulPayments,
        long failedPayments,
        double successRate,
        BigDecimal incomingAmount,
        BigDecimal outgoingAmount,
        /** incomingAmount + outgoingAmount. */
        BigDecimal totalAmount,
        /** Without a provider filter: amount still held in escrow for this user as seller. */
        BigDecimal escrowAmount
) {
}

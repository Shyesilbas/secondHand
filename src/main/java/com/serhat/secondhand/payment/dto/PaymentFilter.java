package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentFilter(
        PaymentTransactionType transactionType,
        String providerName,
        PaymentDirection paymentDirection,
        LocalDateTime dateFrom,
        LocalDateTime dateTo,
        BigDecimal amountMin,
        BigDecimal amountMax,
        String searchTerm
) {}
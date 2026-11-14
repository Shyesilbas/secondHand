package com.serhat.secondhand.payment.dto;

import org.springframework.format.annotation.DateTimeFormat;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentFilter(
        PaymentTransactionType transactionType,
        String providerName,
        PaymentDirection paymentDirection,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
        BigDecimal amountMin,
        BigDecimal amountMax,
        String searchTerm
) {}
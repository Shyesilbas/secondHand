package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentFilter(
        PaymentTransactionType transactionType,
        PaymentType paymentType,
        PaymentDirection paymentDirection,
        LocalDateTime dateFrom,
        LocalDateTime dateTo,
        BigDecimal amountMin,
        BigDecimal amountMax,
        String sellerName
) {}
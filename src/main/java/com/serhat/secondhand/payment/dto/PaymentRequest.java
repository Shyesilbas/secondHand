package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentRequest(
    Long toUserId,
    UUID listingId,
    BigDecimal amount,
    PaymentType paymentType,
    PaymentTransactionType transactionType,
    PaymentDirection paymentDirection,
    CreditCardDto creditCard
) {
}
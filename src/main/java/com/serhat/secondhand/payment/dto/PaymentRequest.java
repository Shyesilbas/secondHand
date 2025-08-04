package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentType;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentRequest(
    Long toUserId,
    UUID listingId,
    BigDecimal amount,
    PaymentType paymentType,
    CreditCardDto creditCard
) {
}
package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder
public record PaymentRequest(
        Long fromUserId,
        Long toUserId,
        String receiverName,
        String receiverSurname,
        UUID listingId,
        BigDecimal amount,
        PaymentType paymentType,
        PaymentTransactionType transactionType,
        PaymentDirection paymentDirection,
        String verificationCode,
        boolean agreementsAccepted,
        List<UUID> acceptedAgreementIds,
        String idempotencyKey
) {
}

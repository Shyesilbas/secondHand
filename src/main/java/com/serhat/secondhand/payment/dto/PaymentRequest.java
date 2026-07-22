package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder(toBuilder = true)
public record PaymentRequest(
        Long fromUserId,
        Long toUserId,
        String receiverName,
        String receiverSurname,
        UUID listingId,
        Long orderItemId,
        String listingTitle,
        String listingNo,
        BigDecimal amount,
        String currency,
        String providerName,
        PaymentTransactionType transactionType,
        PaymentDirection paymentDirection,
        String verificationCode,
        boolean agreementsAccepted,
        List<UUID> acceptedAgreementIds,
        String idempotencyKey,
        PaymentStatus status,
        UUID orderId,
        String description
) {
}

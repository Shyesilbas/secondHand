package com.serhat.secondhand.showcase.dto;

import com.serhat.secondhand.payment.entity.PaymentType;

import java.util.List;
import java.util.UUID;


public record ShowcasePaymentRequest(
        UUID listingId,
        int days,
        PaymentType paymentType,
        String verificationCode,
        boolean agreementsAccepted,
        List<UUID> acceptedAgreementIds,
        String idempotencyKey
) {
}

package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentType;

import java.util.List;
import java.util.UUID;

public record ListingFeePaymentRequest(
        PaymentType paymentType,
        UUID listingId,
        String verificationCode,
        boolean agreementsAccepted,
        List<UUID> acceptedAgreementIds
) {
}

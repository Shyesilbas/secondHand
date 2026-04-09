package com.serhat.secondhand.listing.domain.dto.request.listing;

import com.serhat.secondhand.payment.entity.PaymentType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ListingFeePaymentRequest(
    UUID listingId,
    Long userId,
    BigDecimal amount,
    String currency,
    PaymentType paymentType,
    String verificationCode,
    boolean agreementsAccepted,
    List<UUID> acceptedAgreementIds,
    String idempotencyKey
) {}

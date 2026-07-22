package com.serhat.secondhand.listing.domain.dto.request.listing;


import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ListingFeePaymentRequest(
    UUID listingId,
    Long userId,
    BigDecimal amount,
    String currency,
    String providerName,
    String verificationCode,
    boolean agreementsAccepted,
    List<UUID> acceptedAgreementIds,
    String idempotencyKey
) {}

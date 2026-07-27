package com.serhat.secondhand.listing.domain.dto.request.listing;


import com.fasterxml.jackson.annotation.JsonAlias;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ListingFeePaymentRequest(
    UUID listingId,
    Long userId,
    BigDecimal amount,
    String currency,
    @JsonAlias({"paymentType", "providerName"})
    String providerName,
    String verificationCode,
    boolean agreementsAccepted,
    List<UUID> acceptedAgreementIds,
    String idempotencyKey
) {}

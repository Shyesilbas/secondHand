package com.serhat.secondhand.showcase.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record BulkShowcasePaymentRequest(
    @NotEmpty(message = "Listing IDs cannot be empty")
    List<UUID> listingIds,
    
    @NotNull(message = "Days cannot be null")
    @Min(value = 1, message = "Minimum showcase duration is 1 day")
    Integer days,

    String verificationCode,
    @JsonAlias({"paymentType", "providerName"})
    String providerName,
    boolean agreementsAccepted,
    List<UUID> acceptedAgreementIds,
    String idempotencyKey
) {}

package com.serhat.secondhand.showcase.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;
import java.util.UUID;


public record ShowcasePaymentRequest(
        @NotNull
        UUID listingId,
        @Positive
        int days,
        @JsonAlias({"paymentType", "providerName"})
        String providerName,
        @NotBlank
        String verificationCode,
        boolean agreementsAccepted,
        List<UUID> acceptedAgreementIds,
        @NotBlank
        String idempotencyKey
) {
}

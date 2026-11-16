package com.serhat.secondhand.user.dto;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record MembershipUpgradeRequest(
        boolean agreementsAccepted,
        @Size(max = 50) List<UUID> acceptedAgreementIds,
        @Size(max = 64) String verificationCode,
        @Size(max = 128) String idempotencyKey
) {
}

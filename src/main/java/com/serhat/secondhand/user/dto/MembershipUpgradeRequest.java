package com.serhat.secondhand.user.dto;

import java.util.List;
import java.util.UUID;

public record MembershipUpgradeRequest(
        boolean agreementsAccepted,
        List<UUID> acceptedAgreementIds,
        String verificationCode,
        String idempotencyKey
) {
}

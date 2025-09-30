package com.serhat.secondhand.core.verification.dto;

import com.serhat.secondhand.core.verification.Verification;

import java.time.LocalDateTime;
import java.util.UUID;

public class VerificationSummaryDto {
    public UUID id;
    public String codeType;
    public LocalDateTime createdAt;
    public LocalDateTime codeExpiresAt;

    public static VerificationSummaryDto from(Verification v) {
        VerificationSummaryDto dto = new VerificationSummaryDto();
        dto.id = v.getId();
        dto.codeType = v.getCodeType() != null ? v.getCodeType().name() : null;
        dto.createdAt = v.getCreatedAt();
        dto.codeExpiresAt = v.getCodeExpiresAt();
        return dto;
    }
}



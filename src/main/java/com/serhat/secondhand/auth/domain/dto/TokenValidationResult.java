package com.serhat.secondhand.auth.domain.dto;

import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;

public record TokenValidationResult(TokenStatus status, String message) {
    private static final TokenValidationResult VALID_INSTANCE = new TokenValidationResult(TokenStatus.ACTIVE, "Token is valid.");

    public static TokenValidationResult valid() {
        return VALID_INSTANCE;
    }

    public boolean isNotValid() {
        return status != TokenStatus.ACTIVE;
    }
}

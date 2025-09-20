package com.serhat.secondhand.agreements.util;

import lombok.Getter;

@Getter
public enum AgreementErrorCodes {
    AGREEMENT_NOT_FOUND("AGREEMENT_NOT_FOUND", "Agreement not found for type or id"),
    INVALID_VERSION("INVALID_VERSION", "Invalid version format. Expected format: x.y.z");

    private final String code;
    private final String message;

    AgreementErrorCodes(String code, String message) {
        this.code = code;
        this.message = message;
    }

}

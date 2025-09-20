package com.serhat.secondhand.agreements.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum AgreementErrorCodes implements ErrorCode {
    AGREEMENT_NOT_FOUND("AGREEMENT_NOT_FOUND", "Agreement not found for type or id", HttpStatus.NOT_FOUND),
    INVALID_VERSION("INVALID_VERSION", "Invalid version format. Expected format: x.y.z", HttpStatus.BAD_REQUEST),
    UNKNOWN_AGREEMENT_TYPE("UNKNOWN_AGREEMENT_TYPE", "Unknown agreement type", HttpStatus.BAD_REQUEST),
    INVALID_AGREEMENT_TYPE("INVALID_AGREEMENT_TYPE", "Invalid agreement type", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    AgreementErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

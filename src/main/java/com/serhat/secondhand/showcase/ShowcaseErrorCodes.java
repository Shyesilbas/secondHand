package com.serhat.secondhand.showcase;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ShowcaseErrorCodes implements ErrorCode {
    SHOWCASE_NOT_FOUND("SHOWCASE_NOT_FOUND", "Showcase not found for listing or user", HttpStatus.NOT_FOUND),
    INVALID_SHOWCASE_TYPE("INVALID_SHOWCASE_TYPE", "Invalid showcase type", HttpStatus.BAD_REQUEST),
    SHOWCASE_NOT_ACTIVE("SHOWCASE_NOT_ACTIVE", "Showcase is not active" , HttpStatus.BAD_REQUEST ),
    INVALID_DAYS_COUNT("INVALID_DAYS_COUNT", "Invalid days count. Expected value: 1-30" , HttpStatus.BAD_REQUEST ),
    PAYMENT_FAILED("PAYMENT_FAILED", "Payment processing failed for showcase", HttpStatus.PAYMENT_REQUIRED);


    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ShowcaseErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

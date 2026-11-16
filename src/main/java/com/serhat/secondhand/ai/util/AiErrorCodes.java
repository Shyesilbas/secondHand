package com.serhat.secondhand.ai.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum AiErrorCodes implements ErrorCode {
    AURA_LIMIT_EXCEEDED("AURA_LIMIT_EXCEEDED", "Günlük Aura AI kullanım limitinize ulaştınız.", HttpStatus.FORBIDDEN),
    AI_DAILY_BUDGET_EXCEEDED("AI_DAILY_BUDGET_EXCEEDED", "Platformun günlük AI kullanım kapasitesi dolmuştur. Lütfen daha sonra tekrar deneyiniz.", HttpStatus.TOO_MANY_REQUESTS),
    AI_RATE_LIMIT_EXCEEDED("AI_RATE_LIMIT_EXCEEDED", "The AI service is temporarily unavailable. Please try again in a few minutes.", HttpStatus.TOO_MANY_REQUESTS),
    AI_SERVICE_ERROR("AI_SERVICE_ERROR", "The AI service encountered an error. Please try again later.", HttpStatus.BAD_GATEWAY),
    AI_EMPTY_RESPONSE("AI_EMPTY_RESPONSE", "The AI service returned no answer.", HttpStatus.BAD_GATEWAY),
    AI_REQUEST_INTERRUPTED("AI_REQUEST_INTERRUPTED", "The request was interrupted. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR),
    AI_UNEXPECTED_ERROR("AI_UNEXPECTED_ERROR", "An unexpected error occurred. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR),
    AI_MAX_RETRIES_EXCEEDED("AI_MAX_RETRIES_EXCEEDED", "Request failed after maximum retries.", HttpStatus.SERVICE_UNAVAILABLE),
    AI_AUTHENTICATION_REQUIRED("AI_AUTHENTICATION_REQUIRED", "Authentication is required to use Aura AI.", HttpStatus.UNAUTHORIZED),
    AI_INVALID_REQUEST("AI_INVALID_REQUEST", "Invalid AI request parameter.", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    AiErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

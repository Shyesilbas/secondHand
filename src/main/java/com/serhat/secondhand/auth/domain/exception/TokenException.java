package com.serhat.secondhand.auth.domain.exception;

import com.serhat.secondhand.auth.domain.dto.TokenValidationResult;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class TokenException extends BusinessException {

    private final TokenValidationResult validationResult;

    public TokenException(TokenValidationResult validationResult) {
        super(validationResult.message(), determineHttpStatus(validationResult), validationResult.status().name());
        this.validationResult = validationResult;
    }

    private static HttpStatus determineHttpStatus(TokenValidationResult result) {
        return switch (result.status()) {
            case REVOKED, EXPIRED, ACTIVE -> HttpStatus.UNAUTHORIZED;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }

}

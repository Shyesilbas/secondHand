package com.serhat.secondhand.auth.domain.exception;

import com.serhat.secondhand.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class InvalidRefreshTokenException extends BusinessException {

    public InvalidRefreshTokenException(String message, String errorCode) {
        super(message, HttpStatus.UNAUTHORIZED, errorCode);
    }

    public static InvalidRefreshTokenException invalid() {
        return new InvalidRefreshTokenException("Invalid refresh token.", "INVALID_REFRESH_TOKEN");
    }

    public static InvalidRefreshTokenException revoked() {
        return new InvalidRefreshTokenException("Refresh token has been revoked.", "REVOKED_REFRESH_TOKEN");
    }
    
    public static InvalidRefreshTokenException notFound() {
        return new InvalidRefreshTokenException("Refresh token not found.", "REFRESH_TOKEN_NOT_FOUND");
    }
} 
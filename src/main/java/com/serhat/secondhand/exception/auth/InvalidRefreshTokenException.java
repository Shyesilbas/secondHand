package com.serhat.secondhand.exception.auth;

import com.serhat.secondhand.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class InvalidRefreshTokenException extends BusinessException {
    
    public InvalidRefreshTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN");
    }
    
    public static InvalidRefreshTokenException notFound() {
        return new InvalidRefreshTokenException("Refresh token not found. Please login again.");
    }
    
    public static InvalidRefreshTokenException expired() {
        return new InvalidRefreshTokenException("Refresh token has expired. Please login again.");
    }
    
    public static InvalidRefreshTokenException invalid() {
        return new InvalidRefreshTokenException("Invalid refresh token. Please login again.");
    }
    
    public static InvalidRefreshTokenException revoked() {
        return new InvalidRefreshTokenException("Refresh token has been revoked. Please login again.");
    }
} 
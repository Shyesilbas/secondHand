package com.serhat.secondhand.core.exception;

import org.springframework.http.HttpStatus;

public class AuthenticationNotFoundException extends BusinessException {

    public AuthenticationNotFoundException(String message, String errorCode) {
        super(message, HttpStatus.UNAUTHORIZED, errorCode);
    }
}

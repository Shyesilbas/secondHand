package com.serhat.secondhand.core.exception;

import org.springframework.http.HttpStatus;

public class VerificationCodeMismatchException extends BusinessException {

    public VerificationCodeMismatchException(String message, String errorCode) {
        super(message, HttpStatus.BAD_REQUEST, errorCode);
    }

}

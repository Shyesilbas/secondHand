package com.serhat.secondhand.core.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final String errorCode;

    public BusinessException(String message, HttpStatus httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCodeEnum) {
        super(errorCodeEnum.getMessage());
        this.httpStatus = errorCodeEnum.getHttpStatus();
        this.errorCode = errorCodeEnum.getCode();
    }
}


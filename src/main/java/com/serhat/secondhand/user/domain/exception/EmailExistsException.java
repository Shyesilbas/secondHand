package com.serhat.secondhand.user.domain.exception;

import com.serhat.secondhand.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class EmailExistsException extends BusinessException {
    public EmailExistsException(String message) {
        super(message, HttpStatus.CONFLICT, "EMAIL_EXISTS");
    }
}

package com.serhat.secondhand.user.domain.exception;

import com.serhat.secondhand.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class UserAlreadyExistsException extends BusinessException {

    public UserAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT, "USER_ALREADY_EXISTS");
    }

    public static UserAlreadyExistsException withEmail(String email) {
        return new UserAlreadyExistsException(String.format("User with email [%s] already exists.", email));
    }

    public static UserAlreadyExistsException withPhone(String phone) {
        return new UserAlreadyExistsException(String.format("User with phone number [%s] already exists.", phone));
    }
}

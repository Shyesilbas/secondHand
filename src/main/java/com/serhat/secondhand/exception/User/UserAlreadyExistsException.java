package com.serhat.secondhand.exception.User;

import com.serhat.secondhand.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class UserAlreadyExistsException extends BusinessException {
    
    public UserAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT, "USER_ALREADY_EXISTS");
    }
    
    public static UserAlreadyExistsException withEmail(String email) {
        return new UserAlreadyExistsException("User with email '" + email + "' already exists");
    }
    
    public static UserAlreadyExistsException withPhone(String phone) {
        return new UserAlreadyExistsException("User with phone number '" + phone + "' already exists");
    }
}

package com.serhat.secondhand.exception.User;

import com.serhat.secondhand.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class UserAlreadyLoggedOutException extends BusinessException {
    
    public UserAlreadyLoggedOutException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "USER_ALREADY_LOGGED_OUT");
    }
    
    public static UserAlreadyLoggedOutException defaultMessage() {
        return new UserAlreadyLoggedOutException("User is already logged out. No active sessions found.");
    }
} 
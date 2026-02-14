package com.serhat.secondhand.user.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum UserErrorCodes implements ErrorCode {
    USER_NOT_FOUND_BY_EMAIL("USER_NOT_FOUND_BY_EMAIL", "User not found with email", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("USER_NOT_FOUND_BY_EMAIL", "User not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND_BY_ID("USER_NOT_FOUND_BY_ID", "User not found with id", HttpStatus.NOT_FOUND),
    PHONE_NUMBER_UNCHANGED("PHONE_NUMBER_UNCHANGED", "New phone number cannot be the same as the old one", HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_ALREADY_IN_USE("PHONE_NUMBER_ALREADY_IN_USE", "Phone number is already in use", HttpStatus.CONFLICT),
    ACCOUNT_ALREADY_VERIFIED("ACCOUNT_ALREADY_VERIFIED", "Your account is already verified", HttpStatus.BAD_REQUEST),
    EMAIL_UNCHANGED("EMAIL_UNCHANGED", "New email cannot be the same as the old one", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_IN_USE("EMAIL_ALREADY_IN_USE", "The email is already in use", HttpStatus.CONFLICT),
    NO_ACTIVE_VERIFICATION_CODE("NO_ACTIVE_VERIFICATION_CODE", "No active verification code found. Please request a new code", HttpStatus.BAD_REQUEST),
    INCORRECT_VERIFICATION_CODE("INCORRECT_VERIFICATION_CODE", "Incorrect verification code", HttpStatus.BAD_REQUEST),
    INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS("INCORRECT_VERIFICATION_CODE_WITH_ATTEMPTS", "Incorrect verification code. Attempts left: %d", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    UserErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

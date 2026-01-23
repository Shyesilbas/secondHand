package com.serhat.secondhand.auth.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum AuthErrorCodes implements ErrorCode {
    AGREEMENTS_NOT_ACCEPTED("AGREEMENTS_NOT_ACCEPTED", "All required agreements must be accepted for registration", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Invalid username or password", HttpStatus.UNAUTHORIZED),
    ACCOUNT_NOT_ACTIVE("ACCOUNT_NOT_ACTIVE", "Account is not active", HttpStatus.FORBIDDEN),
    USER_ALREADY_LOGGED_OUT("USER_ALREADY_LOGGED_OUT", "User is already logged out", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN("INVALID_REFRESH_TOKEN", "Invalid or expired refresh token", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_NOT_FOUND("REFRESH_TOKEN_NOT_FOUND", "Refresh token not found", HttpStatus.NOT_FOUND),
    REFRESH_TOKEN_REVOKED("REFRESH_TOKEN_REVOKED", "Refresh token has been revoked", HttpStatus.UNAUTHORIZED),
    INCORRECT_CURRENT_PASSWORD("INCORRECT_CURRENT_PASSWORD", "Current password is incorrect", HttpStatus.BAD_REQUEST),
    PASSWORD_SAME_AS_CURRENT("PASSWORD_SAME_AS_CURRENT", "New password must be different from current password", HttpStatus.BAD_REQUEST),
    TOO_MANY_VERIFICATION_ATTEMPTS("TOO_MANY_VERIFICATION_ATTEMPTS", "Too many failed attempts. Please request a new code.", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    AuthErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

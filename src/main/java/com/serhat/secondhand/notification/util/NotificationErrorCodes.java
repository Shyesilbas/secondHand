package com.serhat.secondhand.notification.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum NotificationErrorCodes implements ErrorCode {
    USER_NOT_FOUND("NOTIFICATION_USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
    NOTIFICATION_NOT_FOUND("NOTIFICATION_NOT_FOUND", "Notification not found", HttpStatus.NOT_FOUND),
    NOTIFICATION_NOT_BELONGS_TO_USER("NOTIFICATION_NOT_BELONGS_TO_USER", "Notification does not belong to user", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    NotificationErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}


package com.serhat.secondhand.follow.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum FollowErrorCodes implements ErrorCode {
    CANNOT_FOLLOW_SELF("FOLLOW_001", "You cannot follow yourself", HttpStatus.BAD_REQUEST),
    ALREADY_FOLLOWING("FOLLOW_002", "You are already following this user", HttpStatus.CONFLICT),
    NOT_FOLLOWING("FOLLOW_003", "You are not following this user", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("FOLLOW_004", "User not found", HttpStatus.NOT_FOUND),
    FOLLOW_NOT_FOUND("FOLLOW_005", "Follow relationship not found", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    FollowErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

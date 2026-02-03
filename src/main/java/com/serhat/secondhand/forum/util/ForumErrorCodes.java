package com.serhat.secondhand.forum.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.Optional;

public enum ForumErrorCodes implements ErrorCode {
    THREAD_NOT_FOUND("FORUM_THREAD_NOT_FOUND", "Thread not found", HttpStatus.NOT_FOUND),
    COMMENT_NOT_FOUND("FORUM_COMMENT_NOT_FOUND", "Comment not found", HttpStatus.NOT_FOUND),
    PARENT_COMMENT_INVALID("FORUM_PARENT_COMMENT_INVALID", "Parent comment is invalid for this thread", HttpStatus.BAD_REQUEST),
    FORBIDDEN("FORUM_FORBIDDEN", "You are not allowed to perform this action", HttpStatus.FORBIDDEN),
    INVALID_REQUEST("FORUM_INVALID_REQUEST", "Invalid request", HttpStatus.BAD_REQUEST),
    CONFLICT("FORUM_CONFLICT", "Conflict detected, please retry", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ForumErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public static Optional<ForumErrorCodes> fromCode(String code) {
        if (code == null || code.isBlank()) return Optional.empty();
        return Arrays.stream(values()).filter(e -> e.code.equals(code)).findFirst();
    }
}


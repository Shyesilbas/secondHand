package com.serhat.secondhand.chat.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ChatErrorCodes implements ErrorCode {
    LISTING_NOT_FOUND("LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    SENDER_USER_NOT_FOUND("SENDER_USER_NOT_FOUND", "Sender user not found", HttpStatus.NOT_FOUND),
    RECIPIENT_USER_NOT_FOUND("RECIPIENT_USER_NOT_FOUND", "Recipient user not found", HttpStatus.NOT_FOUND),
    CHAT_ROOM_NOT_FOUND("CHAT_ROOM_NOT_FOUND", "Chat room not found", HttpStatus.NOT_FOUND),
    MESSAGE_NOT_FOUND("MESSAGE_NOT_FOUND", "Message not found", HttpStatus.NOT_FOUND),
    ACCESS_DENIED("ACCESS_DENIED", "Access denied", HttpStatus.FORBIDDEN),
    INVALID_MESSAGE_CONTENT("INVALID_MESSAGE_CONTENT", "Message content cannot be empty", HttpStatus.BAD_REQUEST),
    MESSAGE_TOO_LONG("MESSAGE_TOO_LONG", "Message content is too long", HttpStatus.BAD_REQUEST),
    CHAT_DISABLED_BY_SELLER("CHAT_DISABLED_BY_SELLER", "Messaging is turned off for this listing", HttpStatus.FORBIDDEN),
    CHAT_DISABLED_BY_USER("CHAT_DISABLED_BY_USER", "This user does not accept messages", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ChatErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

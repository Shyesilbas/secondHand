package com.serhat.secondhand.user.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum RestrictionErrorCodes implements ErrorCode {
    ACCOUNT_RESTRICTED_CHAT("ACCOUNT_RESTRICTED_CHAT", "Your account is restricted from sending messages due to a community guidelines violation", HttpStatus.FORBIDDEN),
    ACCOUNT_RESTRICTED_LISTING("ACCOUNT_RESTRICTED_LISTING", "Your account is restricted from publishing listings due to a community guidelines violation", HttpStatus.FORBIDDEN),
    ACCOUNT_RESTRICTED_OFFER("ACCOUNT_RESTRICTED_OFFER", "Your account is restricted from making offers due to a community guidelines violation", HttpStatus.FORBIDDEN),
    ACCOUNT_RESTRICTED_CHECKOUT("ACCOUNT_RESTRICTED_CHECKOUT", "Your account is restricted from placing new orders due to a community guidelines violation", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    RestrictionErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

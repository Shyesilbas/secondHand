package com.serhat.secondhand.favorite.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum FavoriteErrorCodes implements ErrorCode {
    ALREADY_FAVORITED("ALREADY_FAVORITED", "Listing is already in favorites", HttpStatus.BAD_REQUEST),
    LISTING_NOT_FOUND("LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    INACTIVE_LISTING("INACTIVE_LISTING", "Cannot favorite inactive listing", HttpStatus.BAD_REQUEST),
    OWN_LISTING("OWN_LISTING", "Cannot favorite own listing", HttpStatus.BAD_REQUEST),
    NOT_FAVORITED("NOT_FAVORITED", "Listing is not in favorites", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    FavoriteErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

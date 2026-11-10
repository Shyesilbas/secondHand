package com.serhat.secondhand.favoritelist.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum FavoriteListErrorCodes implements ErrorCode {
    FAVORITE_LIST_LIMIT_EXCEEDED("FAVORITE_LIST_LIMIT_EXCEEDED", "Maximum list limit reached", HttpStatus.BAD_REQUEST),
    FAVORITE_LIST_NAME_EXISTS("FAVORITE_LIST_NAME_EXISTS", "A list with this name already exists", HttpStatus.CONFLICT),
    FAVORITE_LIST_NOT_FOUND("FAVORITE_LIST_NOT_FOUND", "List not found", HttpStatus.NOT_FOUND),
    FAVORITE_LIST_PRIVATE("FAVORITE_LIST_PRIVATE", "This list is private", HttpStatus.FORBIDDEN),
    FAVORITE_LIST_ITEM_LIMIT_EXCEEDED("FAVORITE_LIST_ITEM_LIMIT_EXCEEDED", "List item limit reached", HttpStatus.BAD_REQUEST),
    LISTING_NOT_FOUND("FAVORITE_LIST_LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    ITEM_ALREADY_IN_LIST("ITEM_ALREADY_IN_LIST", "Item already in list", HttpStatus.CONFLICT),
    ITEM_NOT_IN_LIST("ITEM_NOT_IN_LIST", "Item not in list", HttpStatus.NOT_FOUND),
    CANNOT_LIKE_PRIVATE_LIST("CANNOT_LIKE_PRIVATE_LIST", "Cannot like a private list", HttpStatus.FORBIDDEN),
    CANNOT_LIKE_OWN_LIST("CANNOT_LIKE_OWN_LIST", "Cannot like your own list", HttpStatus.BAD_REQUEST),
    ALREADY_LIKED("ALREADY_LIKED", "Already liked this list", HttpStatus.CONFLICT),
    NOT_LIKED("NOT_LIKED", "Not liked this list", HttpStatus.BAD_REQUEST),
    NOT_LIST_OWNER("NOT_LIST_OWNER", "You don't have permission to modify this list", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    FavoriteListErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

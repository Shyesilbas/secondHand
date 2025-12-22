package com.serhat.secondhand.cart.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum CartErrorCodes implements ErrorCode {
    LISTING_NOT_FOUND("LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    LISTING_NOT_ACTIVE("LISTING_NOT_ACTIVE", "Listing status must be active to add to cart", HttpStatus.BAD_REQUEST),
    LISTING_TYPE_NOT_ALLOWED("LISTING_TYPE_NOT_ALLOWED", "This listing type is not allowed to add to cart", HttpStatus.BAD_REQUEST),
    ITEM_NOT_FOUND_IN_CART("ITEM_NOT_FOUND_IN_CART", "Item not found in cart", HttpStatus.NOT_FOUND),
    INVALID_QUANTITY("CART_INVALID_QUANTITY", "Quantity must be at least 1", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK("CART_INSUFFICIENT_STOCK", "Insufficient stock for this listing", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    CartErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}


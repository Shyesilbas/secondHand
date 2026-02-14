package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ListingErrorCodes implements ErrorCode {
    LISTING_NOT_FOUND("LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    LISTING_FEE_NOT_PAID("LISTING_FEE_NOT_PAID", "Listing creation fee has not been paid", HttpStatus.BAD_REQUEST),
    INVALID_LISTING_STATUS("INVALID_LISTING_STATUS", "Invalid listing status for this operation", HttpStatus.BAD_REQUEST),
    NOT_LISTING_OWNER("NOT_LISTING_OWNER", "User is not the owner of this listing", HttpStatus.FORBIDDEN),
    INVALID_QUANTITY("LISTING_INVALID_QUANTITY", "Quantity must be at least 1", HttpStatus.BAD_REQUEST),
    STOCK_INSUFFICIENT("LISTING_STOCK_INSUFFICIENT", "Insufficient stock for this listing", HttpStatus.CONFLICT),
    INVALID_LISTING_ID("INVALID_LISTING_ID", "Invalid listing ID" , HttpStatus.BAD_REQUEST ),
    LISTING_IS_RESERVED("RESERVED_LISTING", "This item is currently in another customer's cart. It may become available again in 15 minutes if they don't complete the purchase." , HttpStatus.CONFLICT ),
    LISTING_BELONGS_TO_USER("Listing Belongs to User", "Listing belongs to user" ,HttpStatus.UNPROCESSABLE_ENTITY );

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ListingErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

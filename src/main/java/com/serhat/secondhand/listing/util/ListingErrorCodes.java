package com.serhat.secondhand.listing.util;

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
    INVALID_PRICE("LISTING_INVALID_PRICE", "Price must be non-negative", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_TRANSITION("INVALID_STATUS_TRANSITION", "Invalid status transition for this listing", HttpStatus.BAD_REQUEST),
    STOCK_INSUFFICIENT("LISTING_STOCK_INSUFFICIENT", "Insufficient stock for this listing", HttpStatus.CONFLICT),
    INVALID_LISTING_ID("INVALID_LISTING_ID", "Invalid listing ID" , HttpStatus.BAD_REQUEST ),
    LISTING_IS_RESERVED("RESERVED_LISTING", "This item is currently in another customer's cart. It may become available again in 15 minutes if they don't complete the purchase." , HttpStatus.CONFLICT ),
    LISTING_BELONGS_TO_USER("LISTING_BELONGS_TO_USER", "Listing belongs to user" ,HttpStatus.UNPROCESSABLE_ENTITY ),
    LISTING_REQUIRED("LISTING_REQUIRED", "Listing is required", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_UNKNOWN("ATTRIBUTE_UNKNOWN", "Attribute is not defined for this listing", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_CATALOG_LEVEL("ATTRIBUTE_CATALOG_LEVEL", "Attribute comes from the catalog and cannot be set on a listing", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_TYPE_MISMATCH("ATTRIBUTE_TYPE_MISMATCH", "Attribute value has the wrong type", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_OUT_OF_RANGE("ATTRIBUTE_OUT_OF_RANGE", "Attribute value is out of range", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_INVALID_OPTION("ATTRIBUTE_INVALID_OPTION", "Attribute value is not an allowed option", HttpStatus.BAD_REQUEST),
    ATTRIBUTE_REQUIRED("ATTRIBUTE_REQUIRED", "Required attribute is missing", HttpStatus.BAD_REQUEST),
    LISTING_ACCESS_DENIED_BLOCKED("LISTING_ACCESS_DENIED_BLOCKED", "This listing is not available to you", HttpStatus.FORBIDDEN),
    BULK_LISTING_LIMIT_EXCEEDED("BULK_LISTING_LIMIT_EXCEEDED", "Too many listing IDs requested in bulk", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ListingErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

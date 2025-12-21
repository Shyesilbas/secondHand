package com.serhat.secondhand.offer.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum OfferErrorCodes implements ErrorCode {
    LISTING_NOT_FOUND("OFFER_LISTING_NOT_FOUND", "Listing not found", HttpStatus.NOT_FOUND),
    LISTING_NOT_ACTIVE("OFFER_LISTING_NOT_ACTIVE", "Listing must be active to make an offer", HttpStatus.BAD_REQUEST),
    LISTING_TYPE_NOT_ALLOWED("OFFER_LISTING_TYPE_NOT_ALLOWED", "Offers are not allowed for this listing type", HttpStatus.BAD_REQUEST),
    SELF_OFFER_NOT_ALLOWED("OFFER_SELF_NOT_ALLOWED", "You cannot make an offer on your own listing", HttpStatus.BAD_REQUEST),
    OFFER_NOT_FOUND("OFFER_NOT_FOUND", "Offer not found", HttpStatus.NOT_FOUND),
    OFFER_EXPIRED("OFFER_EXPIRED", "Offer has expired", HttpStatus.BAD_REQUEST),
    OFFER_NOT_PENDING("OFFER_NOT_PENDING", "Offer is not pending", HttpStatus.BAD_REQUEST),
    OFFER_NOT_ACCEPTED("OFFER_NOT_ACCEPTED", "Offer is not accepted", HttpStatus.BAD_REQUEST),
    OFFER_NOT_ALLOWED("OFFER_NOT_ALLOWED", "You are not allowed to perform this action", HttpStatus.FORBIDDEN),
    OFFER_ALREADY_ACCEPTED_FOR_LISTING("OFFER_ALREADY_ACCEPTED_FOR_LISTING", "There is already an accepted offer for this listing", HttpStatus.CONFLICT),
    INVALID_QUANTITY("OFFER_INVALID_QUANTITY", "Quantity must be at least 1", HttpStatus.BAD_REQUEST),
    INVALID_TOTAL_PRICE("OFFER_INVALID_TOTAL_PRICE", "Total price must be greater than 0", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    OfferErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}


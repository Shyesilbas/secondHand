package com.serhat.secondhand.review.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ReviewErrorCodes implements ErrorCode {
    ORDER_ITEM_NOT_FOUND("ORDER_ITEM_NOT_FOUND", "Order item not found", HttpStatus.NOT_FOUND),
    ORDER_ITEM_NOT_BELONG_TO_USER("ORDER_ITEM_NOT_BELONG_TO_USER", "Order item does not belong to user", HttpStatus.FORBIDDEN),
    ORDER_NOT_DELIVERED("ORDER_NOT_DELIVERED", "Can only review delivered orders", HttpStatus.BAD_REQUEST),
    REVIEW_ALREADY_EXISTS("REVIEW_ALREADY_EXISTS", "Review already exists for this order item", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ReviewErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}


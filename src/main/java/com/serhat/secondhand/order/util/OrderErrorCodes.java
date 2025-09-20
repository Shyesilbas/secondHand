package com.serhat.secondhand.order.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum OrderErrorCodes implements ErrorCode {
    CART_EMPTY("CART_EMPTY", "Cart is empty", HttpStatus.BAD_REQUEST),
    ADDRESS_NOT_BELONG_TO_USER("ADDRESS_NOT_BELONG_TO_USER", "Address does not belong to user", HttpStatus.FORBIDDEN),
    BILLING_ADDRESS_NOT_BELONG_TO_USER("BILLING_ADDRESS_NOT_BELONG_TO_USER", "Billing address does not belong to user", HttpStatus.FORBIDDEN),
    ORDER_NOT_FOUND("ORDER_NOT_FOUND", "Order not found", HttpStatus.NOT_FOUND),
    ORDER_NOT_BELONG_TO_USER("ORDER_NOT_BELONG_TO_USER", "Order does not belong to user", HttpStatus.FORBIDDEN),
    ORDER_CANNOT_BE_CANCELLED("ORDER_CANNOT_BE_CANCELLED", "Order cannot be cancelled", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    OrderErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

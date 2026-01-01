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
    ORDER_CANNOT_BE_CANCELLED("ORDER_CANNOT_BE_CANCELLED", "Order cannot be cancelled", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_REFUNDED("ORDER_CANNOT_BE_REFUNDED", "Order cannot be refunded", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_COMPLETED("ORDER_CANNOT_BE_COMPLETED", "Order cannot be completed", HttpStatus.BAD_REQUEST),
    ORDER_ALREADY_COMPLETED("ORDER_ALREADY_COMPLETED", "Order is already completed", HttpStatus.BAD_REQUEST),
    ORDER_ITEM_ALREADY_CANCELLED("ORDER_ITEM_ALREADY_CANCELLED", "Order item is already cancelled", HttpStatus.BAD_REQUEST),
    ORDER_ITEM_ALREADY_REFUNDED("ORDER_ITEM_ALREADY_REFUNDED", "Order item is already refunded", HttpStatus.BAD_REQUEST),
    REFUND_TIME_EXPIRED("REFUND_TIME_EXPIRED", "Refund time has expired (48 hours passed)", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    OrderErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

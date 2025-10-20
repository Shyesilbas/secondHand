package com.serhat.secondhand.refund.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum RefundErrorCodes implements ErrorCode {
    REFUND_NOT_FOUND("REFUND_NOT_FOUND", "Refund request not found", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND("ORDER_NOT_FOUND", "Order not found", HttpStatus.NOT_FOUND),
    ORDER_ITEM_NOT_FOUND("ORDER_ITEM_NOT_FOUND", "Order item not found", HttpStatus.NOT_FOUND),
    CANCELLATION_WINDOW_EXPIRED("CANCELLATION_WINDOW_EXPIRED", "Cancellation window has expired. You can only cancel within 1 hour of order creation", HttpStatus.BAD_REQUEST),
    REFUND_ALREADY_EXISTS("REFUND_ALREADY_EXISTS", "A refund request already exists for this order item", HttpStatus.CONFLICT),
    INVALID_REFUND_STATUS("INVALID_REFUND_STATUS", "Invalid refund status for this operation", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED_ACCESS("UNAUTHORIZED_ACCESS", "You are not authorized to access this refund request", HttpStatus.FORBIDDEN),
    REFUND_REASON_REQUIRED("REFUND_REASON_REQUIRED", "Refund reason is required", HttpStatus.BAD_REQUEST),
    ORDER_NOT_PAID("ORDER_NOT_PAID", "Cannot create refund for unpaid order", HttpStatus.BAD_REQUEST),
    ORDER_ALREADY_REFUNDED("ORDER_ALREADY_REFUNDED", "Order has already been fully refunded", HttpStatus.BAD_REQUEST),
    CANNOT_CANCEL_REFUND("CANNOT_CANCEL_REFUND", "Cannot cancel refund in current status", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    RefundErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}



package com.serhat.secondhand.user.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum AddressErrorCodes implements ErrorCode {
    MAX_ADDRESSES_EXCEEDED("MAX_ADDRESSES_EXCEEDED", "A user can have at most 3 addresses", HttpStatus.BAD_REQUEST),
    ADDRESS_NOT_FOUND("ADDRESS_NOT_FOUND", "Address not found", HttpStatus.NOT_FOUND),
    SHIPPING_ADDRESS_NOT_FOUND("SHIPPING_ADDRESS_NOT_FOUND", "Shipping address not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_ADDRESS_ACCESS("UNAUTHORIZED_ADDRESS_ACCESS", "Unauthorized access to address", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    AddressErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

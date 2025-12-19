package com.serhat.secondhand.coupon.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum CouponErrorCodes implements ErrorCode {
    COUPON_NOT_FOUND("COUPON_NOT_FOUND", "Coupon not found", HttpStatus.NOT_FOUND),
    COUPON_INACTIVE("COUPON_INACTIVE", "Coupon is inactive", HttpStatus.BAD_REQUEST),
    COUPON_EXPIRED("COUPON_EXPIRED", "Coupon is expired or not yet active", HttpStatus.BAD_REQUEST),
    COUPON_USAGE_LIMIT_REACHED("COUPON_USAGE_LIMIT_REACHED", "Coupon usage limit reached", HttpStatus.BAD_REQUEST),
    COUPON_NOT_APPLICABLE("COUPON_NOT_APPLICABLE", "Coupon is not applicable to this cart", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    CouponErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}


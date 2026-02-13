package com.serhat.secondhand.cart.exception;

import com.serhat.secondhand.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class ReservationException extends BusinessException {

    public ReservationException(String message) {
        super(message, HttpStatus.CONFLICT, "RESERVATION_FAILED");
    }

    public ReservationException(String message, String errorCode) {
        super(message, HttpStatus.CONFLICT, errorCode);
    }
}

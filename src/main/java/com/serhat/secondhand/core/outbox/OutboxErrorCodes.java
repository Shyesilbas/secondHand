package com.serhat.secondhand.core.outbox;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum OutboxErrorCodes implements ErrorCode {
    OUTBOX_EVENT_NOT_REQUEUEABLE("OUTBOX_EVENT_NOT_REQUEUEABLE",
            "Outbox event does not exist or is not in FAILED state", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    OutboxErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

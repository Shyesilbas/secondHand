package com.serhat.secondhand.complaint.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ComplaintErrorCodes implements ErrorCode {
    COMPLAINER_ID_NULL("COMPLAINER_ID_NULL", "Complainer ID cannot be null", HttpStatus.BAD_REQUEST),
    COMPLAINED_USER_ID_NULL("COMPLAINED_USER_ID_NULL", "Complained user ID cannot be null", HttpStatus.BAD_REQUEST),
    COMPLAINT_NOT_FOUND("COMPLAINT_NOT_FOUND", "Complaint not found", HttpStatus.NOT_FOUND),
    CANNOT_COMPLAIN_ABOUT_SELF("CANNOT_COMPLAIN_ABOUT_SELF", "Users cannot complain about themselves", HttpStatus.BAD_REQUEST),
    COMPLAINT_ALREADY_EXISTS("COMPLAINT_ALREADY_EXISTS", "You have already submitted a complaint about this user", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ComplaintErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

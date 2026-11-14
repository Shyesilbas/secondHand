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
    COMPLAINT_ALREADY_EXISTS("COMPLAINT_ALREADY_EXISTS", "You already have an open complaint about this user", HttpStatus.CONFLICT),
    COMPLAINT_LISTING_NOT_FOUND("COMPLAINT_LISTING_NOT_FOUND", "The reported listing does not exist", HttpStatus.NOT_FOUND),
    COMPLAINT_LISTING_NOT_OWNED_BY_USER("COMPLAINT_LISTING_NOT_OWNED_BY_USER", "The reported listing does not belong to the reported user", HttpStatus.BAD_REQUEST),
    COMPLAINT_MESSAGE_REQUIRES_CHAT_ROOM("COMPLAINT_MESSAGE_REQUIRES_CHAT_ROOM", "A reported message must be sent together with its chat room", HttpStatus.BAD_REQUEST),
    COMPLAINT_CHAT_NOT_SHARED("COMPLAINT_CHAT_NOT_SHARED", "Both users must be participants of the reported chat", HttpStatus.FORBIDDEN),
    COMPLAINT_MESSAGE_NOT_FROM_USER("COMPLAINT_MESSAGE_NOT_FROM_USER", "The reported message was not sent by the reported user", HttpStatus.BAD_REQUEST),
    COMPLAINT_TOO_MANY_EVIDENCE_IMAGES("COMPLAINT_TOO_MANY_EVIDENCE_IMAGES", "Too many evidence images attached", HttpStatus.BAD_REQUEST),
    COMPLAINT_DAILY_LIMIT_REACHED("COMPLAINT_DAILY_LIMIT_REACHED", "Daily complaint limit reached, please try again tomorrow", HttpStatus.TOO_MANY_REQUESTS),
    COMPLAINT_RATE_LIMIT_UNAVAILABLE("COMPLAINT_RATE_LIMIT_UNAVAILABLE", "Complaints cannot be accepted right now, please try again later", HttpStatus.SERVICE_UNAVAILABLE),
    COMPLAINT_INVALID_EVIDENCE_IMAGE_URL("COMPLAINT_INVALID_EVIDENCE_IMAGE_URL", "Evidence images must be uploaded through the platform image service", HttpStatus.BAD_REQUEST),
    APPEAL_NOT_ALLOWED("APPEAL_NOT_ALLOWED", "Only the penalized user can appeal this decision", HttpStatus.FORBIDDEN),
    APPEAL_NOT_APPEALABLE("APPEAL_NOT_APPEALABLE", "This decision cannot be appealed", HttpStatus.BAD_REQUEST),
    APPEAL_ALREADY_SUBMITTED("APPEAL_ALREADY_SUBMITTED", "This decision has already been appealed", HttpStatus.CONFLICT),
    APPEAL_WINDOW_CLOSED("APPEAL_WINDOW_CLOSED", "The appeal period for this decision has ended", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ComplaintErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

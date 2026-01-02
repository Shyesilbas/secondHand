package com.serhat.secondhand.campaign.util;

import com.serhat.secondhand.core.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum CampaignErrorCodes implements ErrorCode {
    CAMPAIGN_NOT_FOUND("CAMPAIGN_NOT_FOUND", "Campaign not found", HttpStatus.NOT_FOUND),
    CAMPAIGN_NOT_OWNED("CAMPAIGN_NOT_OWNED", "Campaign does not belong to user", HttpStatus.FORBIDDEN),
    CAMPAIGN_INVALID("CAMPAIGN_INVALID", "Campaign is invalid", HttpStatus.BAD_REQUEST),
    CAMPAIGN_EXPIRED("CAMPAIGN_EXPIRED", "Campaign is expired", HttpStatus.BAD_REQUEST),
    CAMPAIGN_NOT_ALLOWED_FOR_TYPE("CAMPAIGN_NOT_ALLOWED_FOR_TYPE", "Campaign is not allowed for this listing type", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    CampaignErrorCodes(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}



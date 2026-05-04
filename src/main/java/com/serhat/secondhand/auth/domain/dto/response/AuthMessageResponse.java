package com.serhat.secondhand.auth.domain.dto.response;

public record AuthMessageResponse(String message) {
    public static AuthMessageResponse of(String message) {
        return new AuthMessageResponse(message);
    }
}


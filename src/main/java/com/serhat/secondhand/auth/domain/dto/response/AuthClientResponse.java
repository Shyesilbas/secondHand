package com.serhat.secondhand.auth.domain.dto.response;

import lombok.Builder;

/** Login/refresh body. Tokens travel only in httpOnly cookies, never in the body (GV-07). */
@Builder
public record AuthClientResponse(
        String message,
        Long userId,
        String email,
        boolean success,
        String plan,
        String planExpiry
) {
    public static AuthClientResponse from(LoginResponse response) {
        return AuthClientResponse.builder()
                .message(response.getMessage())
                .userId(response.getUserId())
                .email(response.getEmail())
                .success(response.isSuccess())
                .plan(response.getPlan())
                .planExpiry(response.getPlanExpiry())
                .build();
    }
}

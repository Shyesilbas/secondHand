package com.serhat.secondhand.auth.domain.dto.response;

import lombok.Builder;

@Builder
public record AuthClientResponse(
        String message,
        Long userId,
        String email,
        boolean success
) {
    public static AuthClientResponse from(LoginResponse response) {
        return AuthClientResponse.builder()
                .message(response.getMessage())
                .userId(response.getUserId())
                .email(response.getEmail())
                .success(response.isSuccess())
                .build();
    }
}

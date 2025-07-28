package com.serhat.secondhand.dto.response;

public record RegisterResponse(
        String message,
        Long userId,
        String email,
        String name,
        String surname
) {
}

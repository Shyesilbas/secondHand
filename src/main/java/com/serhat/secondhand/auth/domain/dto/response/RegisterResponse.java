package com.serhat.secondhand.auth.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;

public record RegisterResponse(
        String message,
        Long userId,
        String email,
        String name,
        String surname
) {
}

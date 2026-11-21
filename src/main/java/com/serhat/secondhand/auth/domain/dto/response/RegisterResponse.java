package com.serhat.secondhand.auth.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;

/** Identical for new and already-registered emails; it must never reveal whether an account exists. */
public record RegisterResponse(
        String welcomeMessage,
        String importantMessage,
        String informationMessage,
        String email,
        String name,
        String surname
) {
}

package com.serhat.secondhand.user.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public record UpdateEmailRequest(
        @Email
        @NotEmpty
        String currentEmail,
        @Email(message = "Wrong Email Format")
        @NotEmpty(message = "Email cannot be empty")
        String newEmail
) {
}

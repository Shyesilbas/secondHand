package com.serhat.secondhand.user.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePhoneRequest(
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9]\\d{1,14}$", message = "Please provide a valid phone number")
        String newPhoneNumber
) {
}

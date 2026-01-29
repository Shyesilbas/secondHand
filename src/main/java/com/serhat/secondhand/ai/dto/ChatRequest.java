package com.serhat.secondhand.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "Message cannot be empty")
        @Size(min = 1, max = 5000, message = "Message must be between 1-5000 characters")
        String message
) {
}

package com.serhat.secondhand.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "Message cannot be empty")
        @Size(min = 1, max = 2000, message = "Message must be between 1-2000 characters")
        String message,

        @Size(max = 4000, message = "Context must be at most 4000 characters")
        String context
) {
}

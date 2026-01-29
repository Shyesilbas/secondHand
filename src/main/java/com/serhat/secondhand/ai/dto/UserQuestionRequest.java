package com.serhat.secondhand.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserQuestionRequest(
        @NotBlank(message = "Question cannot be empty")
        @Size(min = 3, max = 5000, message = "Question must be between 3-5000 characters")
        String question,

        String context
) {
}

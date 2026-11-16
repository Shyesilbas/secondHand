package com.serhat.secondhand.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserQuestionRequest(
        @NotBlank(message = "Question cannot be empty")
        @Size(min = 3, max = 2000, message = "Question must be between 3-2000 characters")
        String question,

        @Size(max = 4000, message = "Context must be at most 4000 characters")
        String context
) {
}

package com.serhat.secondhand.ai.agent.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AgentQueryRequest(
        @NotBlank(message = "Message cannot be empty")
        @Size(min = 1, max = 2000, message = "Message must be between 1-2000 characters")
        String message,

        @Size(max = 4000, message = "Context must be at most 4000 characters")
        String context,

        Boolean agentMode,

        @Valid
        AgentUiContextRequest uiContext
) {
}

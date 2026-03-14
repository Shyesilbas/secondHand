package com.serhat.secondhand.ai.agent.dto;

import jakarta.validation.constraints.Size;

import java.util.Map;

public record AgentUiContextRequest(
        @Size(max = 100, message = "Current page must be at most 100 characters")
        String currentPage,

        @Size(max = 255, message = "Route must be at most 255 characters")
        String route,

        @Size(max = 100, message = "Listing id must be at most 100 characters")
        String listingId,

        Map<String, String> filters
) {
}

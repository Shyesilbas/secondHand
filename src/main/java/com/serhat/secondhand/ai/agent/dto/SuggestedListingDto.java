package com.serhat.secondhand.ai.agent.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SuggestedListingDto(
        String id,
        String listingNo,
        String title,
        String price,
        String currency,
        String city,
        String district,
        String imageUrl
) {
}

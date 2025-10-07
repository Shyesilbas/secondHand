package com.serhat.secondhand.showcase.dto;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record ShowcaseDto(
        UUID id,
        UUID listingId,
        Long userId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        BigDecimal totalCost,
        BigDecimal dailyCost,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        ListingDto listing
) {
}

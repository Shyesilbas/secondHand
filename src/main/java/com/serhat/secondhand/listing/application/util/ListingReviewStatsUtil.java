package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.review.service.ReviewService;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListingReviewStatsUtil {
    private final ReviewService reviewService;

    public void enrichWithReviewStats(ListingDto dto) {
        if (dto != null && dto.getId() != null) {
            Map<UUID, ReviewStatsDto> statsMap = reviewService.getListingReviewStatsDto(List.of(dto.getId()));
            dto.setReviewStats(statsMap.getOrDefault(dto.getId(), ReviewStatsDto.empty()));
        }
    }

    public void enrichWithReviewStats(List<ListingDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }

        List<UUID> listingIds = dtos.stream()
                .map(ListingDto::getId)
                .toList();

        Map<UUID, ReviewStatsDto> statsMap = reviewService.getListingReviewStatsDto(listingIds);

        for (ListingDto dto : dtos) {
            dto.setReviewStats(statsMap.getOrDefault(dto.getId(), ReviewStatsDto.empty()));
        }
    }
}

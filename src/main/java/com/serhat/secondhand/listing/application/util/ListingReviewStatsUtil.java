package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.review.service.ReviewService;
import com.serhat.secondhand.reviews.dto.ReviewStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ListingReviewStatsUtil {
    private final ReviewService reviewService;

    public void enrichWithReviewStats(ListingDto dto) {
        if (dto != null && dto.getId() != null) {
            ReviewStatsDto stats = reviewService.getListingReviewStatsDto(dto.getId());
            dto.setReviewStats(stats);
        }
    }

    public void enrichWithReviewStats(List<ListingDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }

        Map<UUID, ReviewStatsDto> statsMap = dtos.stream()
                .collect(Collectors.toMap(
                    ListingDto::getId,
                    dto -> reviewService.getListingReviewStatsDto(dto.getId())
                ));

        for (ListingDto dto : dtos) {
            dto.setReviewStats(statsMap.getOrDefault(dto.getId(), ReviewStatsDto.empty()));
        }
    }
}

package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.service.IReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListingReviewStatsUtil {

    private final IReviewService reviewService;


    public ListingDto enrichWithReviewStats(ListingDto dto) {
        if (dto == null || dto.getId() == null) {
            return dto;
        }

        Map<UUID, ReviewStatsDto> statsMap = reviewService
                .getListingReviewStatsDto(List.of(dto.getId()));
        dto.setReviewStats(statsMap.getOrDefault(dto.getId(), ReviewStatsDto.empty()));

        return dto;
    }

    public List<ListingDto> enrichWithReviewStats(List<ListingDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return dtos;
        }

        List<UUID> listingIds = dtos.stream()
                .map(ListingDto::getId)
                .filter(Objects::nonNull)
                .toList();

        if (listingIds.isEmpty()) {
            return dtos;
        }

        Map<UUID, ReviewStatsDto> statsMap = reviewService.getListingReviewStatsDto(listingIds);

        dtos.forEach(dto ->
                dto.setReviewStats(statsMap.getOrDefault(dto.getId(), ReviewStatsDto.empty()))
        );

        return dtos;
    }
}
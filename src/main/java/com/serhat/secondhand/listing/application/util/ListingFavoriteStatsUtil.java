package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.favorite.application.FavoriteStatsService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListingFavoriteStatsUtil {

    private final FavoriteStatsService favoriteStatsService;


    public ListingDto enrichWithFavoriteStats(ListingDto dto, Long userId) {
        if (dto != null && dto.getId() != null) {
            FavoriteStatsDto stats = favoriteStatsService.getFavoriteStats(dto.getId(), userId);
            dto.setFavoriteStats(stats);
        }
        return dto;
    }


    public List<ListingDto> enrichWithFavoriteStats(List<ListingDto> dtos, Long userId) {
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

        Map<UUID, FavoriteStatsDto> statsMap = favoriteStatsService
                .getFavoriteStatsForListings(listingIds, userId);

        dtos.forEach(dto ->
                dto.setFavoriteStats(
                        statsMap.getOrDefault(dto.getId(), createEmptyStats(dto.getId()))
                )
        );

        return dtos;
    }

    private FavoriteStatsDto createEmptyStats(UUID listingId) {
        return FavoriteStatsDto.builder()
                .listingId(listingId)
                .favoriteCount(0L)
                .isFavorited(false)
                .build();
    }
}
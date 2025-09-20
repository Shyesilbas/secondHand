package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.favorite.application.FavoriteStatsService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListingFavoriteStatsUtil {
    private final FavoriteStatsService favoriteStatsService;

    public void enrichWithFavoriteStats(ListingDto dto, String userEmail) {
        if (dto != null && dto.getId() != null) {
            FavoriteStatsDto stats = favoriteStatsService.getFavoriteStats(dto.getId(), userEmail);
            dto.setFavoriteStats(stats);
        }
    }

    public void enrichWithFavoriteStats(List<ListingDto> dtos, String userEmail) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }
        List<UUID> listingIds = dtos.stream()
                .map(ListingDto::getId)
                .toList();
        Map<UUID, FavoriteStatsDto> statsMap = favoriteStatsService.getFavoriteStatsForListings(listingIds, userEmail);
        for (ListingDto dto : dtos) {
            dto.setFavoriteStats(statsMap.getOrDefault(dto.getId(),
                    FavoriteStatsDto.builder()
                            .listingId(dto.getId())
                            .favoriteCount(0L)
                            .isFavorited(false)
                            .build()
            ));
        }
    }
}

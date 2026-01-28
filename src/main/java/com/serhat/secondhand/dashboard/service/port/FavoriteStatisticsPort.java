package com.serhat.secondhand.dashboard.service.port;

import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface FavoriteStatisticsPort {
    long countByListingSellerId(Long sellerId);
    Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, String userEmail);

    Long countByUserId(Long buyerId);
}


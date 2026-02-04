package com.serhat.secondhand.dashboard.service.adapter;

import com.serhat.secondhand.dashboard.service.port.FavoriteStatisticsPort;
import com.serhat.secondhand.favorite.application.FavoriteStatsService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FavoriteStatisticsAdapter implements FavoriteStatisticsPort {
    private final FavoriteRepository favoriteRepository;
    private final FavoriteStatsService favoriteStatsService;

    @Override
    public long countByListingSellerId(Long sellerId) {
        return favoriteRepository.countByListingSellerId(sellerId);
    }

    @Override
    public Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, Long userId) {
        return favoriteStatsService.getFavoriteStatsForListings(listingIds, userId);
    }

    @Override
    public Long countByUserId(Long buyerId) {
        return favoriteRepository.countByUserId(buyerId);
    }
}

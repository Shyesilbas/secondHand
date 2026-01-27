package com.serhat.secondhand.dashboard.service.adapter;

import com.serhat.secondhand.dashboard.service.port.FavoriteStatisticsPort;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FavoriteStatisticsAdapter implements FavoriteStatisticsPort {

    private final FavoriteRepository favoriteRepository;

    @Override
    public long countByListingSellerId(Long sellerId) {
        return favoriteRepository.countByListingSellerId(sellerId);
    }

    @Override
    public long countByListingId(UUID listingId) {
        return favoriteRepository.countByListingId(listingId);
    }
}


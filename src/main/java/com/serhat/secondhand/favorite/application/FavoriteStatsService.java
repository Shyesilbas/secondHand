package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FavoriteStatsService {
    
    private final FavoriteRepository favoriteRepository;
    
    public FavoriteStatsDto getFavoriteStats(UUID listingId, Long userId) {
        long favoriteCount = favoriteRepository.countByListingId(listingId);
        boolean isFavorited = userId != null && favoriteRepository.existsByUserIdAndListingId(userId, listingId);

        return FavoriteStatsDto.builder()
            .listingId(listingId)
            .favoriteCount(favoriteCount)
            .isFavorited(isFavorited)
            .build();
    }

    @Cacheable(
            value = "favoriteStatsBatch",
            key = "T(java.util.Objects).hash(#listingIds) + '_' + #userId",
            unless = "#result == null || #result.isEmpty()"
    )
    public Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, Long userId) {
        log.info("FavoriteStatsService#getFavoriteStatsForListings CACHE MISS for {} listings, userId={}", listingIds.size(), userId);

        List<Object[]> countResults = favoriteRepository.countByListingIds(listingIds);
        Map<UUID, Long> favoriteCounts = countResults.stream()
            .collect(Collectors.toMap(
                result -> (UUID) result[0],
                result -> (Long) result[1]
            ));

        Set<UUID> userFavoriteSet = userId != null ?
                new HashSet<>(favoriteRepository.findListingIdsByUserId(userId)) : Set.of();

            return listingIds.stream()
                    .collect(Collectors.toMap(
                            listingId -> listingId,
                            listingId -> FavoriteStatsDto.builder()
                                    .listingId(listingId)
                                    .favoriteCount(favoriteCounts.getOrDefault(listingId, 0L))
                                    .isFavorited(userFavoriteSet.contains(listingId))
                                    .build()
                    ));
    }
}

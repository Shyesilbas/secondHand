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
            value = "user:stats:favorites",
            key = "T(java.util.Objects).hash(#listingIds) + '_' + #userId",
            unless = "#result == null || #result.isEmpty()"
    )
    public Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, Long userId) {
        log.info("FavoriteStatsService#getFavoriteStatsForListings CACHE MISS for {} listings, userId={}", listingIds.size(), userId);

        if (listingIds == null || listingIds.isEmpty()) {
            return Map.of();
        }

        List<UUID> uniqueListingIds = listingIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (uniqueListingIds.isEmpty()) {
            return Map.of();
        }

        List<Object[]> countResults = favoriteRepository.countByListingIds(uniqueListingIds);
        Map<UUID, Long> favoriteCounts = new HashMap<>();
        if (countResults != null) {
            for (Object[] result : countResults) {
                if (result != null && result.length >= 2 && result[0] != null) {
                    try {
                        UUID listingId = (result[0] instanceof UUID u) ? u : UUID.fromString(result[0].toString());
                        long count = (result[1] instanceof Number n) ? n.longValue() : 0L;
                        favoriteCounts.put(listingId, count);
                    } catch (Exception e) {
                        log.warn("Failed to parse count result for favorite stats: {}", e.getMessage());
                    }
                }
            }
        }

        Set<UUID> userFavoriteSet = new HashSet<>();
        if (userId != null) {
            try {
                List<UUID> userFavs = favoriteRepository.findListingIdsByUserIdAndListingIdIn(userId, uniqueListingIds);
                if (userFavs != null) {
                    userFavoriteSet.addAll(userFavs);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch user favorites: {}", e.getMessage());
            }
        }

        return uniqueListingIds.stream()
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

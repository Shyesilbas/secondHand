package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.dto.ListingFavoriteStatsMap;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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

    /**
     * Order-independent, collision-free cache key: SHA-256 over the sorted distinct ids. The former 32-bit
     * {@code Objects.hash} could map two different id sets to one entry and depended on id order.
     */
    public static String batchKey(List<UUID> listingIds, Long userId) {
        String joined = listingIds == null ? "" : listingIds.stream().filter(Objects::nonNull).distinct()
                .map(UUID::toString).sorted().collect(java.util.stream.Collectors.joining(","));
        try {
            byte[] digest = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(joined.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest) + "_" + userId;
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    @Cacheable(
            value = "user:stats:favorites",
            // "typed:" keeps hits away from entries written as a plain HashMap (String keys) before ListingFavoriteStatsMap.
            key = "'typed:' + T(com.serhat.secondhand.favorite.application.FavoriteStatsService).batchKey(#listingIds, #userId)",
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

        // Cached in Redis: must stay ListingFavoriteStatsMap so UUID keys survive a cache hit.
        ListingFavoriteStatsMap stats = new ListingFavoriteStatsMap();
        for (UUID listingId : uniqueListingIds) {
            stats.put(listingId, FavoriteStatsDto.builder()
                    .listingId(listingId)
                    .favoriteCount(favoriteCounts.getOrDefault(listingId, 0L))
                    .isFavorited(userFavoriteSet.contains(listingId))
                    .build());
        }
        return stats;
    }
}

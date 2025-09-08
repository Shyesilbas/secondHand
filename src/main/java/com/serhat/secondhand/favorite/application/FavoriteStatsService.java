package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service responsible for favorite statistics only
 * This avoids circular dependency between ListingService and FavoriteService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FavoriteStatsService {
    
    private final FavoriteRepository favoriteRepository;
    
    /**
     * Get favorite statistics for a single listing
     */
    public FavoriteStatsDto getFavoriteStats(UUID listingId, String userEmail) {
        long favoriteCount = favoriteRepository.countByListingId(listingId);
        boolean isFavorited = userEmail != null && favoriteRepository.existsByUserEmailAndListingId(userEmail, listingId);
        
        return FavoriteStatsDto.builder()
            .listingId(listingId)
            .favoriteCount(favoriteCount)
            .isFavorited(isFavorited)
            .build();
    }
    
    /**
     * Get favorite statistics for multiple listings in a batch operation
     */
    public Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, String userEmail) {
        log.info("Getting favorite stats for {} listings", listingIds.size());
        
        List<Object[]> countResults = favoriteRepository.countByListingIds(listingIds);
        Map<UUID, Long> favoriteCounts = countResults.stream()
            .collect(Collectors.toMap(
                result -> (UUID) result[0], 
                result -> (Long) result[1]
            ));
        
        List<UUID> userFavoriteIds = userEmail != null ?
            favoriteRepository.findListingIdsByUserEmail(userEmail) : List.of();
        
        return listingIds.stream()
            .collect(Collectors.toMap(
                listingId -> listingId,
                listingId -> FavoriteStatsDto.builder()
                    .listingId(listingId)
                    .favoriteCount(favoriteCounts.getOrDefault(listingId, 0L))
                    .isFavorited(userFavoriteIds.contains(listingId))
                    .build()
            ));
    }
}

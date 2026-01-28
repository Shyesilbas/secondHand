package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    
        public FavoriteStatsDto getFavoriteStats(UUID listingId, String userEmail) {
        long favoriteCount = favoriteRepository.countByListingId(listingId);
        boolean isFavorited = userEmail != null && favoriteRepository.existsByUserEmailAndListingId(userEmail, listingId);
        
        return FavoriteStatsDto.builder()
            .listingId(listingId)
            .favoriteCount(favoriteCount)
            .isFavorited(isFavorited)
            .build();
    }
    
        public Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, String userEmail) {
        log.info("Getting favorite stats for {} listings", listingIds.size());
        
        List<Object[]> countResults = favoriteRepository.countByListingIds(listingIds);
        Map<UUID, Long> favoriteCounts = countResults.stream()
            .collect(Collectors.toMap(
                result -> (UUID) result[0], 
                result -> (Long) result[1]
            ));

            Set<UUID> userFavoriteSet = userEmail != null ?
                    new HashSet<>(favoriteRepository.findListingIdsByUserEmail(userEmail)) : Set.of();

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

package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.cart.application.CartSocialMetricService;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingSocialProofDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Aggregates and produces unified social proof metrics from Redis (views and in-cart count) and favorite count.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ListingSocialProofService {

    private final ListingViewService listingViewService;
    private final CartSocialMetricService cartSocialMetricService;
    private final com.serhat.secondhand.favorite.application.FavoriteStatsService favoriteStatsService;
    private final FavoriteRepository favoriteRepository;

    /**
     * Computes the single unified social proof metrics for a given listing.
     * High performance: Views and Cart counts are resolved from Redis in O(1) time.
     */
    public ListingSocialProofDto getSocialProof(UUID listingId) {
        if (listingId == null) {
            return ListingSocialProofDto.builder()
                    .viewsLast24Hours(0)
                    .inCartCount(0)
                    .favoriteCount(0L)
                    .build();
        }

        int viewsLast24h = listingViewService.getActiveViewerCount(listingId);
        int inCartCount = cartSocialMetricService.getInCartCount(listingId);
        var favStats = favoriteStatsService.getFavoriteStats(listingId, null);
        long favoriteCount = (favStats != null && favStats.getFavoriteCount() != null) ? favStats.getFavoriteCount() : 0L;

        return ListingSocialProofDto.builder()
                .viewsLast24Hours(viewsLast24h)
                .inCartCount(inCartCount)
                .favoriteCount(favoriteCount)
                .build();
    }

    /**
     * Enriches a single ListingDto with its social proof metrics.
     */
    public void enrichWithSocialProof(ListingDto dto) {
        if (dto == null || dto.getId() == null) return;
        dto.setSocialProof(getSocialProof(dto.getId()));
    }

    /**
     * Batch enrichment for a list of ListingDtos (e.g. search/showcase results).
     */
    public void enrichWithSocialProof(Collection<ListingDto> dtos) {
        if (dtos == null || dtos.isEmpty()) return;

        List<UUID> listingIds = dtos.stream()
                .filter(Objects::nonNull)
                .map(ListingDto::getId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (listingIds.isEmpty()) return;

        Map<UUID, Integer> inCartCounts = cartSocialMetricService.getInCartCounts(listingIds);

        // Favorite counts batch lookup
        Map<UUID, Long> favoriteCounts = Collections.emptyMap();
        try {
            List<Object[]> favResults = favoriteRepository.countByListingIds(listingIds);
            if (favResults != null) {
                favoriteCounts = favResults.stream()
                        .collect(Collectors.toMap(
                                row -> (UUID) row[0],
                                row -> ((Number) row[1]).longValue(),
                                (existing, replacement) -> existing
                        ));
            }
        } catch (Exception e) {
            log.warn("Failed to batch fetch favorite counts: {}", e.getMessage());
        }

        for (ListingDto dto : dtos) {
            if (dto == null || dto.getId() == null) continue;
            UUID id = dto.getId();
            int views = listingViewService.getActiveViewerCount(id);
            int inCart = inCartCounts.getOrDefault(id, 0);
            long fav = favoriteCounts.getOrDefault(id, 0L);

            dto.setSocialProof(ListingSocialProofDto.builder()
                    .viewsLast24Hours(views)
                    .inCartCount(inCart)
                    .favoriteCount(fav)
                    .build());
        }
    }
}

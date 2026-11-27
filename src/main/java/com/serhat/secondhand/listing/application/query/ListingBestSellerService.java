package com.serhat.secondhand.listing.application.query;

import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Best-selling active listings across all categories, in sales order, enriched for the viewer. */
@Service
@RequiredArgsConstructor
public class ListingBestSellerService {

    private final ListingSalesRankingService salesRankingService;
    private final ListingQueryService listingQueryService;

    @Cacheable(
            value = "listing:bestSellers:public",
            key = "#requestedLimit != null ? #requestedLimit : 'default'",
            condition = "#userId == null"
    )
    public List<ListingDto> getBestSellers(Integer requestedLimit, Long userId) {
        int limit = clampLimit(requestedLimit);
        List<UUID> rankedIds = salesRankingService.getBestSellerRanking().listingIds();
        if (rankedIds.isEmpty()) {
            return List.of();
        }

        // findByIds applies visibility and blocking but not order; the ranking order is restored here.
        Map<UUID, ListingDto> byId = listingQueryService.findByIds(rankedIds, userId).stream()
                .collect(Collectors.toMap(ListingDto::getId, Function.identity(), (first, second) -> first));

        List<ListingDto> result = new ArrayList<>(limit);
        for (UUID id : rankedIds) {
            ListingDto dto = byId.get(id);
            // The cached ranking can be up to one TTL old; skip listings that are no longer active.
            if (dto != null && dto.getStatus() == ListingStatus.ACTIVE) {
                result.add(dto);
                if (result.size() == limit) {
                    break;
                }
            }
        }
        return result;
    }

    static int clampLimit(Integer requestedLimit) {
        if (requestedLimit == null) {
            return ListingBusinessConstants.DEFAULT_BEST_SELLER_LIMIT;
        }
        return Math.max(1, Math.min(requestedLimit, ListingBusinessConstants.MAX_BEST_SELLER_LIMIT));
    }
}

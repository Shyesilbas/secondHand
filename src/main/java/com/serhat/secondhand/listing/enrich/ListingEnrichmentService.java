package com.serhat.secondhand.listing.enrich;

import com.serhat.secondhand.listing.application.util.ListingCampaignPricingUtil;
import com.serhat.secondhand.listing.application.util.ListingFavoriteStatsUtil;
import com.serhat.secondhand.listing.application.util.ListingReviewStatsUtil;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingEnrichmentService {

    private final ListingFavoriteStatsUtil favoriteStatsUtil;
    private final ListingReviewStatsUtil reviewStatsUtil;
    private final ListingCampaignPricingUtil campaignPricingUtil;

    public ListingDto enrich(ListingDto dto, Long userId) {
        if (dto == null) return null;
        favoriteStatsUtil.enrichWithFavoriteStats(dto, userId);
        reviewStatsUtil.enrichWithReviewStats(dto);
        campaignPricingUtil.enrichWithCampaignPricing(dto);
        return dto;
    }

    public List<ListingDto> enrich(List<ListingDto> dtos, Long userId) {
        if (dtos == null || dtos.isEmpty()) return List.of();
        List<Runnable> tasks = List.of(
                () -> favoriteStatsUtil.enrichWithFavoriteStats(dtos, userId),
                () -> reviewStatsUtil.enrichWithReviewStats(dtos),
                () -> campaignPricingUtil.enrichWithCampaignPricing(dtos)
        );
        tasks.parallelStream().forEach(Runnable::run);
        return dtos;
    }

}

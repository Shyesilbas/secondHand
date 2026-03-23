package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.util.ListingCampaignPricingUtil;
import com.serhat.secondhand.listing.util.ListingFavoriteStatsUtil;
import com.serhat.secondhand.listing.util.ListingReviewStatsUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingEnrichmentService {
    private final ListingFavoriteStatsUtil favoriteStatsUtil;
    private final ListingReviewStatsUtil reviewStatsUtil;
    private final ListingCampaignPricingUtil campaignPricingUtil;

    public List<ListingDto> enrich(List<ListingDto> dtos, Long userId) {
        if (dtos == null || dtos.isEmpty()) return dtos;
        favoriteStatsUtil.enrichWithFavoriteStats(dtos, userId);
        reviewStatsUtil.enrichWithReviewStats(dtos);
        campaignPricingUtil.enrichWithCampaignPricing(dtos);
        return dtos;
    }

    public ListingDto enrichInPlace(ListingDto dto, Long userId) {
        if (dto == null) return null;
        favoriteStatsUtil.enrichWithFavoriteStats(dto, userId);
        reviewStatsUtil.enrichWithReviewStats(dto);
        campaignPricingUtil.enrichWithCampaignPricing(dto);
        return dto;
    }

}

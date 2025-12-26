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

    public ListingDto enrich(ListingDto dto, String userEmail) {
        if (dto == null) return null;
        favoriteStatsUtil.enrichWithFavoriteStats(dto, userEmail);
        reviewStatsUtil.enrichWithReviewStats(dto);
        campaignPricingUtil.enrichWithCampaignPricing(dto);
        return dto;
    }

    public List<ListingDto> enrich(List<ListingDto> dtos, String userEmail) {
        if (dtos == null || dtos.isEmpty()) return List.of();
        favoriteStatsUtil.enrichWithFavoriteStats(dtos, userEmail);
        reviewStatsUtil.enrichWithReviewStats(dtos);
        campaignPricingUtil.enrichWithCampaignPricing(dtos);
        return dtos;
    }

}

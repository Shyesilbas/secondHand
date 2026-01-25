package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.campaign.service.CampaignService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Component
@RequiredArgsConstructor
public class ListingCampaignPricingUtil {

    private final CampaignService campaignService;

    public void enrichWithCampaignPricing(List<ListingDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }

        List<Long> sellerIds = dtos.stream()
                .map(ListingDto::getSellerId)
                .distinct()
                .toList();

        List<Campaign> campaigns = campaignService.loadActiveCampaignsForSellers(sellerIds);
        Map<Long, List<Campaign>> campaignsBySeller = groupBySeller(campaigns);

        for (ListingDto dto : dtos) {
            enrichOne(dto, campaignsBySeller.getOrDefault(dto.getSellerId(), List.of()));
        }
    }

    public void enrichWithCampaignPricing(ListingDto dto) {
        if (dto == null || dto.getSellerId() == null) {
            return;
        }
        List<Campaign> campaigns = campaignService.loadActiveCampaignsForSellers(List.of(dto.getSellerId()));
        enrichOne(dto, campaigns);
    }

    private Map<Long, List<Campaign>> groupBySeller(List<Campaign> campaigns) {
        Map<Long, List<Campaign>> map = new HashMap<>();
        for (Campaign c : campaigns) {
            if (c.getSeller() == null) {
                continue;
            }
            map.computeIfAbsent(c.getSeller().getId(), k -> new ArrayList<>()).add(c);
        }
        return map;
    }

    private void enrichOne(ListingDto dto, List<Campaign> campaigns) {
        if (dto == null) {
            return;
        }
        if (dto.getType() == ListingType.REAL_ESTATE || dto.getType() == ListingType.VEHICLE) {
            dto.setCampaignPrice(dto.getPrice());
            dto.setCampaignDiscountAmount(BigDecimal.ZERO);
            dto.setCampaignDiscountKind(null);
            dto.setCampaignValue(null);
            dto.setCampaignId(null);
            dto.setCampaignName(null);
            return;
        }

        BigDecimal unitPrice = scale(dto.getPrice());
        UUID listingId = dto.getId();
        ListingType type = dto.getType();

        Campaign best = null;
        BigDecimal bestDiscount = BigDecimal.ZERO;

        for (Campaign c : campaigns) {
            if (!isApplicable(c, listingId, type)) {
                continue;
            }
            BigDecimal discount = computeDiscount(c, unitPrice);
            if (discount.compareTo(bestDiscount) > 0) {
                bestDiscount = discount;
                best = c;
            }
        }

        if (best == null || bestDiscount.compareTo(BigDecimal.ZERO) <= 0) {
            dto.setCampaignPrice(unitPrice);
            dto.setCampaignDiscountAmount(BigDecimal.ZERO);
            dto.setCampaignDiscountKind(null);
            dto.setCampaignValue(null);
            dto.setCampaignId(null);
            dto.setCampaignName(null);
            return;
        }

        BigDecimal campaignPrice = scale(unitPrice.subtract(bestDiscount));
        if (campaignPrice.compareTo(BigDecimal.ZERO) < 0) {
            campaignPrice = BigDecimal.ZERO;
        }

        dto.setCampaignPrice(campaignPrice);
        dto.setCampaignDiscountAmount(bestDiscount);
        dto.setCampaignDiscountKind(best.getDiscountKind());
        dto.setCampaignValue(best.getValue());
        dto.setCampaignId(best.getId());
        dto.setCampaignName(best.getName());
    }

    public boolean isApplicable(Campaign campaign, UUID listingId, ListingType type) {
        if (campaign == null || !campaign.isActive()) {
            return false;
        }
        if (type == ListingType.REAL_ESTATE || type == ListingType.VEHICLE) {
            return false;
        }
        
        boolean hasListingFilter = campaign.getEligibleListingIds() != null && !campaign.getEligibleListingIds().isEmpty();
        boolean hasTypeFilter = campaign.getEligibleTypes() != null && !campaign.getEligibleTypes().isEmpty();
        boolean applyToFuture = campaign.isApplyToFutureListings();

        // If applyToFutureListings is true, we can apply to new listings (future listings)
        // In this case, we ignore eligibleListingIds filter and only check type filter
        if (applyToFuture) {
            // If there's a type filter, check if type matches
            if (hasTypeFilter) {
                return campaign.getEligibleTypes().contains(type);
            }
            // If no type filter, apply to all (ignore listing filter when applyToFuture is true)
            return true;
        }

        // Original logic for applyToFutureListings = false (only apply to existing listings)
        if (hasListingFilter && campaign.getEligibleListingIds().contains(listingId)) {
            return true;
        }
        if (hasTypeFilter && campaign.getEligibleTypes().contains(type)) {
            return true;
        }
        return !hasListingFilter && !hasTypeFilter;
    }

    private BigDecimal computeDiscount(Campaign campaign, BigDecimal unitPrice) {
        if (campaign.getDiscountKind() == CampaignDiscountKind.PERCENT) {
            BigDecimal pct = campaign.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            return scale(unitPrice.multiply(pct));
        }
        return scale(campaign.getValue());
    }

    private BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}



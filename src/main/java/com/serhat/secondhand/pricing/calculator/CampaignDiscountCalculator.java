package com.serhat.secondhand.pricing.calculator;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.pricing.util.PricingUtil;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class CampaignDiscountCalculator {

    public Map<Long, List<Campaign>> groupCampaignsBySeller(List<Campaign> campaigns) {
        Map<Long, List<Campaign>> map = new HashMap<>();
        for (Campaign c : campaigns) {
            if (c.getSeller() == null) {
                continue;
            }
            Long sellerId = c.getSeller().getId();
            map.computeIfAbsent(sellerId, k -> new ArrayList<>()).add(c);
        }
        return map;
    }

    public AppliedCampaignDto findBestCampaignForListing(List<Campaign> campaigns, Listing listing) {
        if (campaigns == null || campaigns.isEmpty() || listing == null) {
            return null;
        }

        BigDecimal unitPrice = PricingUtil.scale(listing.getPrice());
        UUID listingId = listing.getId();
        ListingType type = listing.getListingType();

        BigDecimal bestDiscount = BigDecimal.ZERO;
        Campaign bestCampaign = null;

        for (Campaign c : campaigns) {
            if (!isCampaignApplicable(c, listingId, type)) {
                continue;
            }

            BigDecimal discount = computeCampaignDiscountAmount(c, unitPrice);
            if (discount.compareTo(bestDiscount) > 0) {
                bestDiscount = discount;
                bestCampaign = c;
            }
        }

        if (bestCampaign == null) {
            return null;
        }

        return AppliedCampaignDto.builder()
                .campaignId(bestCampaign.getId())
                .name(bestCampaign.getName())
                .discountKind(bestCampaign.getDiscountKind())
                .value(bestCampaign.getValue())
                .discountAmount(bestDiscount)
                .build();
    }

    private boolean isCampaignApplicable(Campaign campaign, UUID listingId, ListingType type) {
        if (campaign == null || !campaign.isActive()) {
            return false;
        }
        if (type == ListingType.REAL_ESTATE || type == ListingType.VEHICLE) {
            return false;
        }

        boolean hasListingFilter = campaign.getEligibleListingIds() != null && !campaign.getEligibleListingIds().isEmpty();
        boolean hasTypeFilter = campaign.getEligibleTypes() != null && !campaign.getEligibleTypes().isEmpty();

        if (hasListingFilter && campaign.getEligibleListingIds().contains(listingId)) {
            return true;
        }
        if (hasTypeFilter && campaign.getEligibleTypes().contains(type)) {
            return true;
        }
        return !hasListingFilter && !hasTypeFilter;
    }

    private BigDecimal computeCampaignDiscountAmount(Campaign campaign, BigDecimal unitPrice) {
        if (campaign.getDiscountKind() == CampaignDiscountKind.PERCENT) {
            BigDecimal pct = campaign.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            return PricingUtil.scale(unitPrice.multiply(pct));
        }
        return PricingUtil.scale(campaign.getValue());
    }
}


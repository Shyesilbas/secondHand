package com.serhat.secondhand.pricing.calculator;

import com.serhat.secondhand.campaign.mapper.CampaignMapper;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.listing.application.util.ListingCampaignPricingUtil;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.pricing.util.PricingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CampaignDiscountCalculator {

    private final ListingCampaignPricingUtil campaignPricingUtil;
    private final CampaignMapper campaignMapper;

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
            if (!campaignPricingUtil.isApplicable(c, listingId, type)) {
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

        return campaignMapper.toAppliedCampaignDto(bestCampaign, bestDiscount);
    }

    private BigDecimal computeCampaignDiscountAmount(Campaign campaign, BigDecimal unitPrice) {
        if (campaign.getDiscountKind() == CampaignDiscountKind.PERCENT) {
            BigDecimal pct = campaign.getValue().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            return PricingUtil.scale(unitPrice.multiply(pct));
        }
        return PricingUtil.scale(campaign.getValue());
    }
}


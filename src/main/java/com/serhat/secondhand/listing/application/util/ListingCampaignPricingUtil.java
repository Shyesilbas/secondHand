package com.serhat.secondhand.listing.application.util;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.campaign.service.ICampaignService;
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

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final int SCALE = 2;
    private static final int PRECISION = 6;

    private final ICampaignService campaignService;

    public List<ListingDto> enrichWithCampaignPricing(List<ListingDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return dtos;
        }
        List<Long> sellerIds = dtos.stream()
                .map(ListingDto::getSellerId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (sellerIds.isEmpty()) {
            return dtos;
        }

        List<Campaign> campaigns = campaignService.loadActiveCampaignsForSellers(sellerIds);
        Map<Long, List<Campaign>> campaignsBySeller = groupBySeller(campaigns);

        dtos.forEach(dto -> enrichOne(dto, campaignsBySeller.getOrDefault(dto.getSellerId(), List.of())));

        return dtos;
    }

    public ListingDto enrichWithCampaignPricing(ListingDto dto) {
        if (dto == null || dto.getSellerId() == null) {
            return dto;
        }
        List<Campaign> campaigns = campaignService.loadActiveCampaignsForSellers(List.of(dto.getSellerId()));
        enrichOne(dto, campaigns);
        return dto;
    }

    private Map<Long, List<Campaign>> groupBySeller(List<Campaign> campaigns) {
        Map<Long, List<Campaign>> map = new HashMap<>();
        for (Campaign c : campaigns) {
            if (c.getSeller() != null) {
                map.computeIfAbsent(c.getSeller().getId(), k -> new ArrayList<>()).add(c);
            }
        }
        return map;
    }

    private void enrichOne(ListingDto dto, List<Campaign> campaigns) {
        if (dto == null) {
            return;
        }

        if (isNonCampaignableType(dto.getType())) {
            setNoCampaignData(dto);
            return;
        }

        BigDecimal unitPrice = scale(dto.getPrice());
        Campaign bestCampaign = findBestCampaign(campaigns, dto.getId(), dto.getType(), unitPrice);

        if (bestCampaign == null) {
            setNoCampaignData(dto);
            return;
        }

        applyCampaign(dto, bestCampaign, unitPrice);
    }

    private boolean isNonCampaignableType(ListingType type) {
        return type == ListingType.REAL_ESTATE || type == ListingType.VEHICLE;
    }

    private Campaign findBestCampaign(List<Campaign> campaigns, UUID listingId, ListingType type, BigDecimal unitPrice) {
        Campaign bestCampaign = null;
        BigDecimal bestDiscount = ZERO;

        for (Campaign campaign : campaigns) {
            if (!isApplicable(campaign, listingId, type)) {
                continue;
            }

            BigDecimal discount = computeDiscount(campaign, unitPrice);
            if (discount.compareTo(bestDiscount) > 0) {
                bestDiscount = discount;
                bestCampaign = campaign;
            }
        }

        return bestDiscount.compareTo(ZERO) > 0 ? bestCampaign : null;
    }

    private void applyCampaign(ListingDto dto, Campaign campaign, BigDecimal unitPrice) {
        BigDecimal discount = computeDiscount(campaign, unitPrice);
        BigDecimal campaignPrice = calculateCampaignPrice(unitPrice, discount);

        dto.setCampaignPrice(campaignPrice);
        dto.setCampaignDiscountAmount(discount);
        dto.setCampaignDiscountKind(campaign.getDiscountKind());
        dto.setCampaignValue(campaign.getValue());
        dto.setCampaignId(campaign.getId());
        dto.setCampaignName(campaign.getName());
    }

    private void setNoCampaignData(ListingDto dto) {
        dto.setCampaignPrice(scale(dto.getPrice()));
        dto.setCampaignDiscountAmount(ZERO);
        dto.setCampaignDiscountKind(null);
        dto.setCampaignValue(null);
        dto.setCampaignId(null);
        dto.setCampaignName(null);
    }

    private BigDecimal calculateCampaignPrice(BigDecimal unitPrice, BigDecimal discount) {
        BigDecimal campaignPrice = scale(unitPrice.subtract(discount));
        return campaignPrice.compareTo(ZERO) < 0 ? ZERO : campaignPrice;
    }

    public boolean isApplicable(Campaign campaign, UUID listingId, ListingType type) {
        if (campaign == null || !campaign.isActive() || isNonCampaignableType(type)) {
            return false;
        }

        boolean hasListingFilter = hasFilter(campaign.getEligibleListingIds());
        boolean hasTypeFilter = hasFilter(campaign.getEligibleTypes());

        if (campaign.isApplyToFutureListings()) {
            return !hasTypeFilter || campaign.getEligibleTypes().contains(type);
        }

        if (hasListingFilter && campaign.getEligibleListingIds().contains(listingId)) {
            return true;
        }
        if (hasTypeFilter && campaign.getEligibleTypes().contains(type)) {
            return true;
        }

        return !hasListingFilter && !hasTypeFilter;
    }

    private boolean hasFilter(Collection<?> collection) {
        return collection != null && !collection.isEmpty();
    }

    private BigDecimal computeDiscount(Campaign campaign, BigDecimal unitPrice) {
        if (campaign.getDiscountKind() == CampaignDiscountKind.PERCENT) {
            BigDecimal percentage = campaign.getValue().divide(HUNDRED, PRECISION, RoundingMode.HALF_UP);
            return scale(unitPrice.multiply(percentage));
        }
        return scale(campaign.getValue());
    }

    private BigDecimal scale(BigDecimal value) {
        return value == null ? ZERO : value.setScale(SCALE, RoundingMode.HALF_UP);
    }
}
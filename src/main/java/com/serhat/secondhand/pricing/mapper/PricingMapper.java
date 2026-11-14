package com.serhat.secondhand.pricing.mapper;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.pricing.dto.BundleCampaignProgressDto;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;
import java.util.Map;

@Component
public class PricingMapper {

    public PricingResultDto toEmptyResult() {
        return PricingResultDto.builder()
                .originalSubtotal(BigDecimal.ZERO)
                .subtotalAfterCampaigns(BigDecimal.ZERO)
                .campaignDiscount(BigDecimal.ZERO)
                .couponCode(null)
                .couponDiscount(BigDecimal.ZERO)
                .discountTotal(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .payableBySeller(Map.of())
                .items(List.of())
                .bundleCampaigns(List.of())
                .build();
    }

    public PricingResultDto toResult(BigDecimal originalSubtotal, BigDecimal subtotalAfterCampaigns,
                                     BigDecimal campaignDiscountTotal, String normalizedCouponCode,
                                     BigDecimal couponDiscount, BigDecimal discountTotal, BigDecimal total,
                                     Map<Long, BigDecimal> payableBySeller, List<PricedCartItemDto> pricedItems,
                                     List<BundleCampaignProgressDto> bundleCampaigns) {
        return PricingResultDto.builder()
                .originalSubtotal(originalSubtotal)
                .subtotalAfterCampaigns(subtotalAfterCampaigns)
                .campaignDiscount(campaignDiscountTotal)
                .couponCode(normalizedCouponCode)
                .couponDiscount(couponDiscount)
                .discountTotal(discountTotal)
                .total(total)
                .payableBySeller(payableBySeller)
                .items(pricedItems)
                .bundleCampaigns(bundleCampaigns)
                .build();
    }

    public PricedCartItemDto toPricedCartItemDto(Listing listing, Long sellerId, ListingType type,
                                                 int quantity, BigDecimal unitPrice, BigDecimal campaignUnitPrice,
                                                 BigDecimal originalLineTotal, BigDecimal lineSubtotal, BigDecimal campaignDiscount,
                                                 AppliedCampaignDto appliedCampaign) {
        return PricedCartItemDto.builder()
                .listingId(listing.getId())
                .sellerId(sellerId)
                .listingType(type)
                .quantity(quantity)
                .originalUnitPrice(unitPrice)
                .campaignUnitPrice(campaignUnitPrice)
                .originalLineTotal(originalLineTotal)
                .lineSubtotal(lineSubtotal)
                .campaignDiscount(campaignDiscount)
                .appliedCampaign(appliedCampaign)
                .couponDiscount(BigDecimal.ZERO)
                .netUnitPrice(campaignUnitPrice)
                .netLineTotal(lineSubtotal)
                .build();
    }

    public BundleCampaignProgressDto toBundleProgress(Campaign campaign, User seller, int minQuantity, int qualifyingQuantity) {
        String sellerName = String.join(" ", Stream.of(seller.getName(), seller.getSurname())
                .filter(part -> part != null && !part.isBlank())
                .toList());
        return BundleCampaignProgressDto.builder()
                .campaignId(campaign.getId())
                .campaignName(campaign.getName())
                .sellerId(seller.getId())
                .sellerName(sellerName.isEmpty() ? null : sellerName)
                .discountKind(campaign.getDiscountKind())
                .value(campaign.getValue())
                .minQuantity(minQuantity)
                .qualifyingQuantity(qualifyingQuantity)
                .remainingQuantity(Math.max(0, minQuantity - qualifyingQuantity))
                .unlocked(qualifyingQuantity >= minQuantity)
                .build();
    }

    public String normalizeCouponCode(String couponCode) {
        return couponCode != null && !couponCode.isBlank() ? couponCode.trim().toUpperCase() : null;
    }
}


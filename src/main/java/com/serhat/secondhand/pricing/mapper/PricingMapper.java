package com.serhat.secondhand.pricing.mapper;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
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
                .build();
    }

    public PricingResultDto toResult(BigDecimal originalSubtotal, BigDecimal subtotalAfterCampaigns,
                                     BigDecimal campaignDiscountTotal, String normalizedCouponCode,
                                     BigDecimal couponDiscount, BigDecimal discountTotal, BigDecimal total,
                                     Map<Long, BigDecimal> payableBySeller, List<PricedCartItemDto> pricedItems) {
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
                .build();
    }

    public PricedCartItemDto toPricedCartItemDto(Listing listing, Long sellerId, ListingType type,
                                                 int quantity, BigDecimal unitPrice, BigDecimal campaignUnitPrice,
                                                 BigDecimal lineSubtotal, AppliedCampaignDto appliedCampaign) {
        return PricedCartItemDto.builder()
                .listingId(listing.getId())
                .sellerId(sellerId)
                .listingType(type)
                .quantity(quantity)
                .originalUnitPrice(unitPrice)
                .campaignUnitPrice(campaignUnitPrice)
                .lineSubtotal(lineSubtotal)
                .appliedCampaign(appliedCampaign)
                .build();
    }

    public String normalizeCouponCode(String couponCode) {
        return couponCode != null && !couponCode.isBlank() ? couponCode.trim().toUpperCase() : null;
    }
}


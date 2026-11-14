package com.serhat.secondhand.pricing.dto;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricedCartItemDto {
    private UUID listingId;
    private Long sellerId;
    private ListingType listingType;
    private int quantity;
    private BigDecimal originalUnitPrice;
    private BigDecimal campaignUnitPrice;
    // Line total before the campaign and coupon (listing price x quantity, or the accepted offer total).
    private BigDecimal originalLineTotal;
    private BigDecimal lineSubtotal;
    // Campaign discount of the whole line, computed once by PriceCalculationEngine; zero when no campaign applied.
    private BigDecimal campaignDiscount;
    private AppliedCampaignDto appliedCampaign;
    private BigDecimal couponDiscount;
    private BigDecimal netUnitPrice;
    private BigDecimal netLineTotal;
}



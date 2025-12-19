package com.serhat.secondhand.pricing.dto;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
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
    private BigDecimal lineSubtotal;
    private AppliedCampaignDto appliedCampaign;
}


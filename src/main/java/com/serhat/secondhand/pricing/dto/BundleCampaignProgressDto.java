package com.serhat.secondhand.pricing.dto;

import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Progress of one seller bundle campaign (minQuantity > 1) that the cart already partly or fully covers.
 * Computed by PriceCalculationEngine from the same qualifying quantities that decide the price.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BundleCampaignProgressDto {
    private UUID campaignId;
    private String campaignName;
    private Long sellerId;
    private String sellerName;
    private CampaignDiscountKind discountKind;
    private BigDecimal value;
    private int minQuantity;
    private int qualifyingQuantity;
    private int remainingQuantity;
    private boolean unlocked;
}

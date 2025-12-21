package com.serhat.secondhand.pricing.dto;

import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
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
public class AppliedCampaignDto {
    private UUID campaignId;
    private String name;
    private CampaignDiscountKind discountKind;
    private BigDecimal value;
    private BigDecimal discountAmount;
}



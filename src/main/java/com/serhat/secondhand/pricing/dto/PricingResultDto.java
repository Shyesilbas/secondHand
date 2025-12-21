package com.serhat.secondhand.pricing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingResultDto {
    private BigDecimal originalSubtotal;
    private BigDecimal subtotalAfterCampaigns;
    private BigDecimal campaignDiscount;
    private String couponCode;
    private BigDecimal couponDiscount;
    private BigDecimal discountTotal;
    private BigDecimal total;
    private Map<Long, BigDecimal> payableBySeller;
    private List<PricedCartItemDto> items;
}



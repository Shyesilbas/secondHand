package com.serhat.secondhand.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceDropAlertDto {
    private UUID listingId;
    private String title;
    private String imageUrl;
    private BigDecimal currentPrice;
    private BigDecimal originalPrice;
    private Integer discountPercent;
    private String campaignName;
}

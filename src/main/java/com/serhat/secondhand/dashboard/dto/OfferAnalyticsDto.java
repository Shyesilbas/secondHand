package com.serhat.secondhand.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferAnalyticsDto {
    private long totalOffersReceived;
    private long pendingOffers;
    private long acceptedOffers;
    private long rejectedOffers;
    private long expiredOffers;
    private double acceptanceRate;
    private Map<String, Long> statusCounts;
}

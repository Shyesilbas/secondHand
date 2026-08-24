package com.serhat.secondhand.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuyerOfferStatsDto {
    private long totalOffersSent;
    private long pendingOffers;
    private long acceptedOffers;
    private long rejectedOffers;
}

package com.serhat.secondhand.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FunnelStatsDto {
    private long totalViews;
    private long totalFavorites;
    private long totalOffers;
    private long totalOrders;

    /** Görüntülenmeden Favoriye geçiş oranı (%) */
    private double viewToFavoriteRate;

    /** Favoriden Teklife geçiş oranı (%) */
    private double favoriteToOfferRate;

    /** Teklif/Favoriden Siparişe nihai dönüşüm oranı (%) */
    private double overallConversionRate;
}

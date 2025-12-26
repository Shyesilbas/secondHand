package com.serhat.secondhand.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerDashboardDto {
    
    // Revenue Metrics
    private BigDecimal totalRevenue;
    private BigDecimal revenueGrowth; // Percentage change from previous period
    private List<RevenueDataPoint> revenueTrend; // Time series data
    
    // Sales Statistics
    private Long totalOrders;
    private Long completedOrders;
    private Long pendingOrders;
    private Long cancelledOrders;
    private Long refundedOrders;
    private Map<String, Long> ordersByStatus; // Status -> Count
    
    // Listing Metrics
    private Long totalListings;
    private Long activeListings;
    private Long soldListings;
    private Long deactivatedListings;
    private Long totalViews; // Via favorites count as proxy
    private Long totalFavorites;
    
    // Category Distribution
    private Map<String, BigDecimal> categoryRevenue; // Category -> Revenue
    private Map<String, Long> categoryOrderCount; // Category -> Order Count
    
    // Top Listings
    private List<TopListingDto> topListings; // Top 10 by revenue
    
    // Review Statistics
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution; // Rating (1-5) -> Count
    
    // Period Info
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueDataPoint {
        private LocalDateTime date;
        private BigDecimal revenue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopListingDto {
        private String listingId;
        private String listingNo;
        private String title;
        private BigDecimal revenue;
        private Long orderCount;
        private Long favoriteCount;
        private Double averageRating;
    }
}


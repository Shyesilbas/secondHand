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
public class BuyerDashboardDto {
    
    // Spending Metrics
    private BigDecimal totalSpending;
    private BigDecimal spendingGrowth; // Percentage change from previous period
    private BigDecimal averageOrderValue;
    private List<SpendingDataPoint> spendingTrend; // Time series data
    
    // Order Statistics
    private Long totalOrders;
    private Long completedOrders;
    private Long pendingOrders;
    private Long cancelledOrders;
    private Long refundedOrders;
    private Map<String, Long> ordersByStatus; // Status -> Count
    
    // Category Spending Distribution
    private Map<String, BigDecimal> categorySpending; // Category -> Spending
    private Map<String, Long> categoryOrderCount; // Category -> Order Count
    
    // Favorites
    private Long totalFavorites;
    
    // Review Statistics
    private Long reviewsGiven;
    
    // Period Info
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SpendingDataPoint {
        private LocalDateTime date;
        private BigDecimal spending;
    }
}


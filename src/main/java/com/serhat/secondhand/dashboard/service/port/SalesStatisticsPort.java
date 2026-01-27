package com.serhat.secondhand.dashboard.service.port;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SalesStatisticsPort {

    BigDecimal sumRevenueBySellerAndDateRange(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> getDailyRevenueTrend(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> countDistinctOrdersBySellerAndStatusGrouped(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);

    long countDistinctListingsSoldBySellerAndDateRange(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);

    BigDecimal sumTotalAmountByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    long countOrdersByUserIdAndCreatedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> countOrdersByUserIdAndStatusGrouped(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> getDailySpendingTrend(Long buyerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> sumRevenueBySellerAndCategory(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> sumSpendingByBuyerAndCategory(Long buyerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> countOrdersByBuyerAndCategory(Long buyerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> findTopListingsByRevenue(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);
}


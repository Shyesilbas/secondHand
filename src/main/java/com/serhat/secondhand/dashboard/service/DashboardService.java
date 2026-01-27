package com.serhat.secondhand.dashboard.service;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.dashboard.mapper.DashboardMapper;
import com.serhat.secondhand.dashboard.service.port.*;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.order.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final SalesStatisticsPort salesStatisticsPort;
    private final ListingStatisticsPort listingStatisticsPort;
    private final ReviewStatisticsPort reviewStatisticsPort;
    private final FavoriteStatisticsPort favoriteStatisticsPort;
    private final DashboardMapper dashboardMapper;
    private final ListingViewStatisticsPort listingViewStatisticsPort;

    public SellerDashboardDto getSellerDashboard(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting seller dashboard for user id: {} from {} to {}", sellerId, startDate, endDate);

        BigDecimal totalRevenue = salesStatisticsPort.sumRevenueBySellerAndDateRange(sellerId, startDate, endDate);
        totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;

        // Growth Calculation
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime previousStartDate = startDate.minusDays(daysBetween);
        BigDecimal previousRevenue = salesStatisticsPort.sumRevenueBySellerAndDateRange(sellerId, previousStartDate, startDate);
        previousRevenue = previousRevenue != null ? previousRevenue : BigDecimal.ZERO;
        BigDecimal revenueGrowth = calculateGrowthPercentage(previousRevenue, totalRevenue);

        // Trend
        List<Object[]> dailyRevenue = salesStatisticsPort.getDailyRevenueTrend(sellerId, startDate, endDate);
        List<SellerDashboardDto.RevenueDataPoint> revenueTrend = dailyRevenue.stream()
                .map(row -> dashboardMapper.toRevenueDataPoint(((java.sql.Date) row[0]).toLocalDate(), (BigDecimal) row[1]))
                .collect(Collectors.toList());

        // 2. Order statistics
        List<Object[]> ordersByStatus = salesStatisticsPort.countDistinctOrdersBySellerAndStatusGrouped(sellerId, startDate, endDate);
        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatus);

        long totalOrders = ordersByStatusMap.values().stream().mapToLong(Long::longValue).sum();
        long completedOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.COMPLETED.name(), 0L)
                + ordersByStatusMap.getOrDefault(Order.OrderStatus.DELIVERED.name(), 0L);

        long totalListings = listingStatisticsPort.findBySellerId(sellerId).size();
        long activeListings = listingStatisticsPort.findBySellerIdAndStatus(sellerId, ListingStatus.ACTIVE).size();
        long deactivatedListings = listingStatisticsPort.findBySellerIdAndStatus(sellerId, ListingStatus.INACTIVE).size();
        long soldListings = salesStatisticsPort.countDistinctListingsSoldBySellerAndDateRange(sellerId, startDate, endDate);

        ListingViewStatsDto viewStats = listingViewStatisticsPort.getAggregatedViewStatisticsForSeller(sellerId, startDate, endDate);

        List<Object[]> categoryRevenueRaw = salesStatisticsPort.sumRevenueBySellerAndCategory(sellerId, startDate, endDate);
        Map<String, BigDecimal> categoryRevenue = dashboardMapper.mapCategoryRevenue(categoryRevenueRaw);

        long totalFavorites = favoriteStatisticsPort.countByListingSellerId(sellerId);

        List<Object[]> reviewStats = reviewStatisticsPort.getUserReviewStats(sellerId);
        Long totalReviews = 0L;
        if (reviewStats != null && !reviewStats.isEmpty()) {
            Object[] stats = reviewStats.get(0);
            if (stats[0] != null) {
                totalReviews = ((Number) stats[0]).longValue();
            }
        }

        Map<Integer, Long> ratingDistribution = dashboardMapper.mapRatingDistribution(reviewStats);

        // Top Listings logic...
        List<Object[]> topListingsData = salesStatisticsPort.findTopListingsByRevenue(sellerId, startDate, endDate);
        List<SellerDashboardDto.TopListingDto> topListings = processTopListings(topListingsData);

        return SellerDashboardDto.builder()
                .totalRevenue(totalRevenue)
                .revenueGrowth(revenueGrowth)
                .revenueTrend(revenueTrend)
                .ordersByStatus(ordersByStatusMap)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .totalListings(totalListings)
                .activeListings(activeListings)
                .deactivatedListings(deactivatedListings)
                .soldListings(soldListings)
                .topListings(topListings)
                .totalViews(viewStats.getTotalViews())
                .uniqueViews(viewStats.getUniqueViews())
                .totalFavorites(totalFavorites)
                .averageRating(reviewStatisticsPort.getUserAverageRating(sellerId))
                .totalReviews(totalReviews)
                .ratingDistribution(ratingDistribution)
                .categoryRevenue(categoryRevenue)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }


    public BuyerDashboardDto getBuyerDashboard(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting buyer dashboard for user id: {}", buyerId);

        BigDecimal totalSpending = salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(buyerId, startDate, endDate);
        totalSpending = totalSpending != null ? totalSpending : BigDecimal.ZERO;

        long totalOrders = salesStatisticsPort.countOrdersByUserIdAndCreatedAtBetween(buyerId, startDate, endDate);

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime previousStartDate = startDate.minusDays(daysBetween);
        BigDecimal previousSpending = salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(buyerId, previousStartDate, startDate);
        previousSpending = previousSpending != null ? previousSpending : BigDecimal.ZERO;
        BigDecimal spendingGrowth = calculateGrowthPercentage(previousSpending, totalSpending);

        List<Object[]> spendingTrendRaw = salesStatisticsPort.getDailySpendingTrend(buyerId, startDate, endDate);
        List<BuyerDashboardDto.SpendingDataPoint> spendingTrend = spendingTrendRaw.stream()
                .map(row -> dashboardMapper.toSpendingDataPoint(((java.sql.Date) row[0]).toLocalDate(), (BigDecimal) row[1]))
                .collect(Collectors.toList());

        List<Object[]> ordersByStatusRaw = salesStatisticsPort.countOrdersByUserIdAndStatusGrouped(buyerId, startDate, endDate);
        Map<String, Long> ordersByStatus = dashboardMapper.mapStatusCounts(ordersByStatusRaw);

        long completedOrders = ordersByStatus.getOrDefault(Order.OrderStatus.COMPLETED.name(), 0L)
                + ordersByStatus.getOrDefault(Order.OrderStatus.DELIVERED.name(), 0L);
        long pendingOrders = ordersByStatus.getOrDefault(Order.OrderStatus.PENDING.name(), 0L)
                + ordersByStatus.getOrDefault(Order.OrderStatus.CONFIRMED.name(), 0L)
                + ordersByStatus.getOrDefault(Order.OrderStatus.PROCESSING.name(), 0L)
                + ordersByStatus.getOrDefault(Order.OrderStatus.SHIPPED.name(), 0L);
        long cancelledOrders = ordersByStatus.getOrDefault(Order.OrderStatus.CANCELLED.name(), 0L);
        long refundedOrders = ordersByStatus.getOrDefault(Order.OrderStatus.REFUNDED.name(), 0L);

        BigDecimal averageOrderValue = totalOrders > 0
                ? totalSpending.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<Object[]> categorySpendingRaw = salesStatisticsPort.sumSpendingByBuyerAndCategory(buyerId, startDate, endDate);
        Map<String, BigDecimal> categorySpending = dashboardMapper.mapCategoryRevenue(categorySpendingRaw);

        List<Object[]> categoryOrderCountRaw = salesStatisticsPort.countOrdersByBuyerAndCategory(buyerId, startDate, endDate);
        Map<String, Long> categoryOrderCount = dashboardMapper.mapCategoryOrderCount(categoryOrderCountRaw);

        Long totalFavorites = 0L;

        long reviewsGiven = reviewStatisticsPort.countByReviewerId(buyerId);

        return BuyerDashboardDto.builder()
                .totalSpending(totalSpending)
                .spendingGrowth(spendingGrowth)
                .averageOrderValue(averageOrderValue)
                .spendingTrend(spendingTrend)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .pendingOrders(pendingOrders)
                .cancelledOrders(cancelledOrders)
                .refundedOrders(refundedOrders)
                .ordersByStatus(ordersByStatus)
                .categorySpending(categorySpending)
                .categoryOrderCount(categoryOrderCount)
                .totalFavorites(totalFavorites)
                .reviewsGiven(reviewsGiven)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    private List<SellerDashboardDto.TopListingDto> processTopListings(List<Object[]> topListingsData) {
        List<SellerDashboardDto.TopListingDto> topListings = new ArrayList<>();
        for (Object[] row : topListingsData) {
            if (topListings.size() >= 10) break;
            UUID listingId = (UUID) row[0];
            listingStatisticsPort.findById(listingId).ifPresent(listing -> {
                Long favoriteCount = favoriteStatisticsPort.countByListingId(listingId);
                topListings.add(dashboardMapper.toTopListingDto(row, listing, favoriteCount, 0.0));
            });
        }
        return topListings;
    }

    private BigDecimal calculateGrowthPercentage(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
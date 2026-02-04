package com.serhat.secondhand.dashboard.service;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.dashboard.mapper.DashboardMapper;
import com.serhat.secondhand.dashboard.service.port.*;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;
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
        log.info("Async Seller Dashboard starts: {}", sellerId);

        CompletableFuture<BigDecimal> revenueFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumRevenueBySellerAndDateRange(sellerId, startDate, endDate)).orElse(BigDecimal.ZERO));

        CompletableFuture<List<Object[]>> revenueTrendRawFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.getDailyRevenueTrend(sellerId, startDate, endDate));

        CompletableFuture<List<Object[]>> ordersByStatusFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countDistinctOrdersBySellerAndStatusGrouped(sellerId, startDate, endDate));

        CompletableFuture<Long> totalListingsFuture = CompletableFuture.supplyAsync(() ->
                listingStatisticsPort.countBySellerId(sellerId));

        CompletableFuture<Long> activeListingsFuture = CompletableFuture.supplyAsync(() ->
                listingStatisticsPort.countBySellerIdAndStatus(sellerId, ListingStatus.ACTIVE));

        CompletableFuture<Long> inactiveListingsFuture = CompletableFuture.supplyAsync(() ->
                listingStatisticsPort.countBySellerIdAndStatus(sellerId, ListingStatus.INACTIVE));

        CompletableFuture<ListingViewStatsDto> viewStatsFuture = CompletableFuture.supplyAsync(() ->
                listingViewStatisticsPort.getAggregatedViewStatisticsForSeller(sellerId, startDate, endDate));

        CompletableFuture<Long> totalFavoritesFuture = CompletableFuture.supplyAsync(() ->
                favoriteStatisticsPort.countByListingSellerId(sellerId));

        CompletableFuture<List<Object[]>> categoryRevenueFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.sumRevenueBySellerAndCategory(sellerId, startDate, endDate));

        CompletableFuture<List<Object[]>> reviewStatsFuture = CompletableFuture.supplyAsync(() ->
                reviewStatisticsPort.getUserReviewStats(sellerId));

        CompletableFuture<Double> avgRatingFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(reviewStatisticsPort.getUserAverageRating(sellerId)).orElse(0.0));

        CompletableFuture<List<Object[]>> topListingsRawFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.findTopListingsByRevenue(sellerId, startDate, endDate));

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime prevStart = startDate.minusDays(daysBetween);
        CompletableFuture<BigDecimal> prevRevFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumRevenueBySellerAndDateRange(sellerId, prevStart, startDate)).orElse(BigDecimal.ZERO));

        CompletableFuture<List<Object[]>> categoryOrderCountRawFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersBySellerAndCategory(sellerId, startDate, endDate));

        CompletableFuture.allOf(revenueFuture, revenueTrendRawFuture, ordersByStatusFuture,
                totalListingsFuture, activeListingsFuture, inactiveListingsFuture,
                viewStatsFuture, totalFavoritesFuture, categoryRevenueFuture,
                reviewStatsFuture, avgRatingFuture, topListingsRawFuture, prevRevFuture, categoryOrderCountRawFuture).join();

        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatusFuture.join());
        long totalOrders = ordersByStatusMap.values().stream().mapToLong(Long::longValue).sum();
        long completed = ordersByStatusMap.getOrDefault("COMPLETED", 0L) + ordersByStatusMap.getOrDefault("DELIVERED", 0L);

        List<Object[]> reviewStatsRaw = reviewStatsFuture.join();
        long totalReviews = (reviewStatsRaw != null && !reviewStatsRaw.isEmpty())
                ? ((Number) reviewStatsRaw.get(0)[0]).longValue() : 0L;

        return SellerDashboardDto.builder()
                .totalRevenue(revenueFuture.join())
                .revenueGrowth(calculateGrowthPercentage(prevRevFuture.join(), revenueFuture.join()))
                .revenueTrend(revenueTrendRawFuture.join().stream()
                        .map(row -> dashboardMapper.toRevenueDataPoint(((java.sql.Date) row[0]).toLocalDate(), (BigDecimal) row[1]))
                        .collect(Collectors.toList()))
                .ordersByStatus(ordersByStatusMap)
                .totalOrders(totalOrders)
                .completedOrders(completed)
                .totalListings(totalListingsFuture.join())
                .activeListings(activeListingsFuture.join())
                .deactivatedListings(inactiveListingsFuture.join())
                .totalViews(viewStatsFuture.join().getTotalViews())
                .uniqueViews(viewStatsFuture.join().getUniqueViews())
                .totalFavorites(totalFavoritesFuture.join())
                .categoryRevenue(dashboardMapper.mapCategoryRevenue(categoryRevenueFuture.join()))
                .topListings(processTopListings(topListingsRawFuture.join(), sellerId))
                .averageRating(avgRatingFuture.join())
                .totalReviews(totalReviews)
                .ratingDistribution(dashboardMapper.mapRatingDistribution(reviewStatsRaw))
                .soldListings(salesStatisticsPort.countDistinctListingsSoldBySellerAndDateRange(sellerId, startDate, endDate))
                .categoryOrderCount(dashboardMapper.mapCategoryOrderCount(categoryOrderCountRawFuture.join()))
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    public BuyerDashboardDto getBuyerDashboard(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Async Buyer Dashboard starts: {}", buyerId);

        CompletableFuture<BigDecimal> spendingFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(buyerId, startDate, endDate)).orElse(BigDecimal.ZERO));

        CompletableFuture<Long> totalOrdersFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersByUserIdAndCreatedAtBetween(buyerId, startDate, endDate));

        CompletableFuture<List<Object[]>> spendingTrendFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.getDailySpendingTrend(buyerId, startDate, endDate));

        CompletableFuture<List<Object[]>> ordersByStatusFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersByUserIdAndStatusGrouped(buyerId, startDate, endDate));

        CompletableFuture<List<Object[]>> categorySpendingFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.sumSpendingByBuyerAndCategory(buyerId, startDate, endDate));

        CompletableFuture<List<Object[]>> categoryOrderCountFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersByBuyerAndCategory(buyerId, startDate, endDate));

        CompletableFuture<Long> reviewsGivenFuture = CompletableFuture.supplyAsync(() ->
                reviewStatisticsPort.countByReviewerId(buyerId));

        CompletableFuture<Long> totalFavoritesFuture = CompletableFuture.supplyAsync(() ->
                favoriteStatisticsPort.countByUserId(buyerId));

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime prevStart = startDate.minusDays(daysBetween);
        CompletableFuture<BigDecimal> prevSpendingFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(buyerId, prevStart, startDate)).orElse(BigDecimal.ZERO));

        CompletableFuture.allOf(spendingFuture, totalOrdersFuture, spendingTrendFuture,
                ordersByStatusFuture, categorySpendingFuture, categoryOrderCountFuture,
                reviewsGivenFuture, totalFavoritesFuture, prevSpendingFuture).join();

        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatusFuture.join());
        long totalOrders = totalOrdersFuture.join();
        BigDecimal totalSpending = spendingFuture.join();

        BigDecimal avgOrderValue = (totalOrders > 0)
                ? totalSpending.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return BuyerDashboardDto.builder()
                .totalSpending(totalSpending)
                .spendingGrowth(calculateGrowthPercentage(prevSpendingFuture.join(), totalSpending))
                .averageOrderValue(avgOrderValue)
                .totalOrders(totalOrders)
                .completedOrders(ordersByStatusMap.getOrDefault("COMPLETED", 0L) + ordersByStatusMap.getOrDefault("DELIVERED", 0L))
                .pendingOrders(ordersByStatusMap.getOrDefault("PENDING", 0L) + ordersByStatusMap.getOrDefault("CONFIRMED", 0L)
                        + ordersByStatusMap.getOrDefault("PROCESSING", 0L) + ordersByStatusMap.getOrDefault("SHIPPED", 0L))
                .cancelledOrders(ordersByStatusMap.getOrDefault("CANCELLED", 0L))
                .refundedOrders(ordersByStatusMap.getOrDefault("REFUNDED", 0L))
                .ordersByStatus(ordersByStatusMap)
                .spendingTrend(spendingTrendFuture.join().stream()
                        .map(row -> {
                            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                            return dashboardMapper.toSpendingDataPoint(date, (BigDecimal) row[1]);
                        })
                        .collect(Collectors.toList()))
                .categorySpending(dashboardMapper.mapCategoryRevenue(categorySpendingFuture.join()))
                .categoryOrderCount(dashboardMapper.mapCategoryOrderCount(categoryOrderCountFuture.join()))
                .totalFavorites(totalFavoritesFuture.join())
                .reviewsGiven(reviewsGivenFuture.join())
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    private List<SellerDashboardDto.TopListingDto> processTopListings(List<Object[]> topListingsData, Long userId) {
        if (topListingsData == null || topListingsData.isEmpty()) return new ArrayList<>();

        List<UUID> listingIds = topListingsData.stream()
                .limit(10)
                .map(row -> (UUID) row[0])
                .collect(Collectors.toList());

        Map<UUID, Listing> listingMap = listingStatisticsPort.findAllByIdIn(listingIds)
                .stream().collect(Collectors.toMap(Listing::getId, l -> l));

        Map<UUID, FavoriteStatsDto> favoriteStatsMap = favoriteStatisticsPort.getFavoriteStatsForListings(listingIds, userId);

        return topListingsData.stream()
                .limit(10)
                .map(row -> {
                    UUID id = (UUID) row[0];
                    Listing listing = listingMap.get(id);
                    if (listing == null) return null;

                    Long favCount = favoriteStatsMap.getOrDefault(id, FavoriteStatsDto.builder().favoriteCount(0L).build()).getFavoriteCount();

                    return dashboardMapper.toTopListingDto(row, listing, favCount, 0.0);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
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
package com.serhat.secondhand.dashboard.service;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.dashboard.mapper.DashboardMapper;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.application.ListingViewService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final DashboardMapper dashboardMapper;
    private final ListingViewService listingViewService;

    public SellerDashboardDto getSellerDashboard(User seller, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting seller dashboard for user: {} from {} to {}", seller.getEmail(), startDate, endDate);

        // Revenue metrics
        BigDecimal totalRevenue = orderItemRepository.sumRevenueBySellerAndDateRange(seller, startDate, endDate);
        totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;

        // Calculate revenue growth (compare with previous period of same length)
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime previousStartDate = startDate.minusDays(daysBetween);
        BigDecimal previousRevenue = orderItemRepository.sumRevenueBySellerAndDateRange(seller, previousStartDate, startDate);
        previousRevenue = previousRevenue != null ? previousRevenue : BigDecimal.ZERO;
        BigDecimal revenueGrowth = calculateGrowthPercentage(previousRevenue, totalRevenue);

        // Revenue trend (daily)
        List<Object[]> dailyRevenue = orderItemRepository.getDailyRevenueTrend(seller.getId(), startDate, endDate);
        List<SellerDashboardDto.RevenueDataPoint> revenueTrend = dailyRevenue.stream()
                .map(row -> {
                    LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                    BigDecimal revenue = (BigDecimal) row[1];
                    return dashboardMapper.toRevenueDataPoint(date, revenue);
                })
                .collect(Collectors.toList());

        // Order statistics
        long totalOrders = orderItemRepository.countDistinctOrdersBySellerAndDateRange(seller, startDate, endDate);
        List<Object[]> ordersByStatus = orderItemRepository.countDistinctOrdersBySellerAndStatusGrouped(seller, startDate, endDate);
        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatus);
        
        long completedOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.COMPLETED.name(), 0L);
        long pendingOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.PENDING.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.CONFIRMED.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.PROCESSING.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.SHIPPED.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.DELIVERED.name(), 0L);
        long cancelledOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.CANCELLED.name(), 0L);
        long refundedOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.REFUNDED.name(), 0L);

        // Listing metrics
        long totalListings = listingRepository.countBySellerAndCreatedAtBetween(seller, startDate, endDate);
        List<Object[]> listingsByStatus = listingRepository.countBySellerAndStatusGrouped(seller, startDate, endDate);
        Map<String, Long> listingsByStatusMap = new HashMap<>();
        for (Object[] row : listingsByStatus) {
            listingsByStatusMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        
        long activeListings = listingsByStatusMap.getOrDefault(ListingStatus.ACTIVE.name(), 0L);
        long soldListings = listingsByStatusMap.getOrDefault(ListingStatus.SOLD.name(), 0L);
        long deactivatedListings = listingsByStatusMap.getOrDefault(ListingStatus.INACTIVE.name(), 0L);

        // Get all seller listings to calculate favorites
        List<Listing> sellerListings = listingRepository.findBySeller(seller);
        List<UUID> listingIds = sellerListings.stream().map(Listing::getId).collect(Collectors.toList());
        long totalFavorites = 0L;
        if (!listingIds.isEmpty()) {
            List<Object[]> favoriteCounts = favoriteRepository.countByListingIds(listingIds);
            totalFavorites = favoriteCounts.stream()
                    .mapToLong(row -> ((Number) row[1]).longValue())
                    .sum();
        }

        // Category distribution
        List<Object[]> categoryRevenue = orderItemRepository.sumRevenueBySellerAndCategory(seller, startDate, endDate);
        Map<String, BigDecimal> categoryRevenueMap = dashboardMapper.mapCategoryRevenue(categoryRevenue);
        
        List<Object[]> categoryOrders = orderItemRepository.countOrdersBySellerAndCategory(seller, startDate, endDate);
        Map<String, Long> categoryOrderCountMap = dashboardMapper.mapCategoryOrderCount(categoryOrders);

        // Top listings
        List<Object[]> topListingsData = orderItemRepository.findTopListingsByRevenue(seller, startDate, endDate);
        List<SellerDashboardDto.TopListingDto> topListings = new ArrayList<>();
        for (Object[] row : topListingsData) {
            if (topListings.size() >= 10) break; // Top 10 only
            
            UUID listingId = (UUID) row[0];
            Optional<Listing> listingOpt = listingRepository.findById(listingId);
            if (listingOpt.isPresent()) {
                Listing listing = listingOpt.get();
                Long favoriteCount = favoriteRepository.countByListingId(listingId);
                
                // Get review stats for this listing
                List<UUID> singleListingId = List.of(listingId);
                List<Object[]> reviewStats = reviewRepository.getListingReviewStats(singleListingId);
                Double averageRating = 0.0;
                if (!reviewStats.isEmpty()) {
                    Object[] stats = reviewStats.get(0);
                    if (stats.length >= 2 && stats[1] != null) {
                        averageRating = ((Number) stats[1]).doubleValue();
                    }
                }
                
                SellerDashboardDto.TopListingDto topListing = dashboardMapper.toTopListingDto(row, listing, favoriteCount, averageRating);
                topListings.add(topListing);
            }
        }

        // Review statistics
        List<Object[]> reviewStats = reviewRepository.getUserReviewStats(seller.getId());
        Double averageRating = 0.0;
        Long totalReviews = 0L;
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        
        if (!reviewStats.isEmpty()) {
            Object[] stats = reviewStats.get(0);
            totalReviews = ((Number) stats[0]).longValue();
            if (stats.length >= 2 && stats[1] != null) {
                averageRating = ((Number) stats[1]).doubleValue();
            }
            ratingDistribution = dashboardMapper.mapRatingDistribution(reviewStats);
        }

        // View statistics
        ListingViewStatsDto viewStats = listingViewService.getAggregatedViewStatisticsForSeller(seller, startDate, endDate);
        Long totalViews = viewStats.getTotalViews();
        Long uniqueViews = viewStats.getUniqueViews();

        return SellerDashboardDto.builder()
                .totalRevenue(totalRevenue)
                .revenueGrowth(revenueGrowth)
                .revenueTrend(revenueTrend)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .pendingOrders(pendingOrders)
                .cancelledOrders(cancelledOrders)
                .refundedOrders(refundedOrders)
                .ordersByStatus(ordersByStatusMap)
                .totalListings(totalListings)
                .activeListings(activeListings)
                .soldListings(soldListings)
                .deactivatedListings(deactivatedListings)
                .totalViews(totalViews)
                .uniqueViews(uniqueViews)
                .totalFavorites(totalFavorites)
                .categoryRevenue(categoryRevenueMap)
                .categoryOrderCount(categoryOrderCountMap)
                .topListings(topListings)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .ratingDistribution(ratingDistribution)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    public BuyerDashboardDto getBuyerDashboard(User buyer, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting buyer dashboard for user: {} from {} to {}", buyer.getEmail(), startDate, endDate);

        // Spending metrics
        BigDecimal totalSpending = orderRepository.sumTotalAmountByUserAndDateRange(buyer, startDate, endDate);
        totalSpending = totalSpending != null ? totalSpending : BigDecimal.ZERO;

        // Calculate spending growth
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime previousStartDate = startDate.minusDays(daysBetween);
        BigDecimal previousSpending = orderRepository.sumTotalAmountByUserAndDateRange(buyer, previousStartDate, startDate);
        previousSpending = previousSpending != null ? previousSpending : BigDecimal.ZERO;
        BigDecimal spendingGrowth = calculateGrowthPercentage(previousSpending, totalSpending);

        // Order statistics
        List<Object[]> ordersByStatus = orderRepository.countByUserAndStatusGrouped(buyer, startDate, endDate);
        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatus);
        
        long totalOrders = orderRepository.countByUserAndCreatedAtBetween(buyer, startDate, endDate);
        long completedOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.COMPLETED.name(), 0L);
        long pendingOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.PENDING.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.CONFIRMED.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.PROCESSING.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.SHIPPED.name(), 0L) +
                            ordersByStatusMap.getOrDefault(Order.OrderStatus.DELIVERED.name(), 0L);
        long cancelledOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.CANCELLED.name(), 0L);
        long refundedOrders = ordersByStatusMap.getOrDefault(Order.OrderStatus.REFUNDED.name(), 0L);

        long paidOrdersCount = totalOrders - cancelledOrders - refundedOrders;
        BigDecimal averageOrderValue = paidOrdersCount > 0 
                ? totalSpending.divide(BigDecimal.valueOf(paidOrdersCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Spending trend (daily)
        List<Object[]> dailySpending = orderItemRepository.getDailySpendingTrend(buyer.getId(), startDate, endDate);
        List<BuyerDashboardDto.SpendingDataPoint> spendingTrend = dailySpending.stream()
                .map(row -> {
                    LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                    BigDecimal spending = (BigDecimal) row[1];
                    return dashboardMapper.toSpendingDataPoint(date, spending);
                })
                .collect(Collectors.toList());

        // Category spending distribution
        List<Object[]> categorySpending = orderItemRepository.sumSpendingByBuyerAndCategory(buyer, startDate, endDate);
        Map<String, BigDecimal> categorySpendingMap = dashboardMapper.mapCategoryRevenue(categorySpending);
        
        List<Object[]> categoryOrders = orderItemRepository.countOrdersByBuyerAndCategory(buyer, startDate, endDate);
        Map<String, Long> categoryOrderCountMap = dashboardMapper.mapCategoryOrderCount(categoryOrders);

        // Favorites
        long totalFavorites = favoriteRepository.findListingIdsByUser(buyer).size();

        // Review statistics
        long reviewsGiven = reviewRepository.findByReviewerOrderByCreatedAtDesc(buyer, PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();

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
                .ordersByStatus(ordersByStatusMap)
                .categorySpending(categorySpendingMap)
                .categoryOrderCount(categoryOrderCountMap)
                .totalFavorites(totalFavorites)
                .reviewsGiven(reviewsGiven)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    private BigDecimal calculateGrowthPercentage(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        BigDecimal difference = current.subtract(previous);
        return difference.divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}


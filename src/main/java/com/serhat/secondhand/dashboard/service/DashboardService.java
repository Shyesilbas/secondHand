package com.serhat.secondhand.dashboard.service;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.dashboard.mapper.DashboardMapper;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.application.ListingViewService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    private final UserService userService;
    private final DashboardMapper dashboardMapper;
    private final ListingViewService listingViewService;

    public SellerDashboardDto getSellerDashboard(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting seller dashboard for user id: {} from {} to {}", sellerId, startDate, endDate);

        BigDecimal totalRevenue = orderItemRepository.sumRevenueBySellerAndDateRange(sellerId, startDate, endDate);
        totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;

        // Growth Calculation
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime previousStartDate = startDate.minusDays(daysBetween);
        BigDecimal previousRevenue = orderItemRepository.sumRevenueBySellerAndDateRange(sellerId, previousStartDate, startDate);
        previousRevenue = previousRevenue != null ? previousRevenue : BigDecimal.ZERO;
        BigDecimal revenueGrowth = calculateGrowthPercentage(previousRevenue, totalRevenue);

        // Trend
        List<Object[]> dailyRevenue = orderItemRepository.getDailyRevenueTrend(sellerId, startDate, endDate);
        List<SellerDashboardDto.RevenueDataPoint> revenueTrend = dailyRevenue.stream()
                .map(row -> dashboardMapper.toRevenueDataPoint(((java.sql.Date) row[0]).toLocalDate(), (BigDecimal) row[1]))
                .collect(Collectors.toList());

        // 2. Order statistics
        long totalOrders = orderItemRepository.countDistinctOrdersBySellerAndDateRange(sellerId, startDate, endDate);
        List<Object[]> ordersByStatus = orderItemRepository.countDistinctOrdersBySellerAndStatusGrouped(sellerId, startDate, endDate);
        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatus);

        long totalListings = listingRepository.countBySellerIdAndCreatedAtBetween(sellerId, startDate, endDate);
        List<Object[]> listingsByStatus = listingRepository.countBySellerIdAndStatusGrouped(sellerId, startDate, endDate);
        Map<String, Long> listingsByStatusMap = new HashMap<>();
        for (Object[] row : listingsByStatus) {
            listingsByStatusMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        User seller = userService.findById(sellerId).getData();
        ListingViewStatsDto viewStats = listingViewService.getAggregatedViewStatisticsForSeller(seller.getId(), startDate, endDate);

        // Top Listings logic...
        List<Object[]> topListingsData = orderItemRepository.findTopListingsByRevenue(sellerId, startDate, endDate);
        List<SellerDashboardDto.TopListingDto> topListings = processTopListings(topListingsData);

        return SellerDashboardDto.builder()
                .totalRevenue(totalRevenue)
                .revenueGrowth(revenueGrowth)
                .revenueTrend(revenueTrend)
                .totalOrders(totalOrders)
                .ordersByStatus(ordersByStatusMap)
                .totalListings(totalListings)
                .activeListings(listingsByStatusMap.getOrDefault(ListingStatus.ACTIVE.name(), 0L))
                .soldListings(listingsByStatusMap.getOrDefault(ListingStatus.SOLD.name(), 0L))
                .totalViews(viewStats.getTotalViews())
                .averageRating(reviewRepository.getUserAverageRating(sellerId))
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    public BuyerDashboardDto getBuyerDashboard(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting buyer dashboard for user id: {}", buyerId);

        BigDecimal totalSpending = orderRepository.sumTotalAmountByUserIdAndDateRange(buyerId, startDate, endDate);
        totalSpending = totalSpending != null ? totalSpending : BigDecimal.ZERO;

        long totalOrders = orderRepository.countByUserIdAndCreatedAtBetween(buyerId, startDate, endDate);


        return BuyerDashboardDto.builder()
                .totalSpending(totalSpending)
                .totalOrders(totalOrders)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    private List<SellerDashboardDto.TopListingDto> processTopListings(List<Object[]> topListingsData) {
        List<SellerDashboardDto.TopListingDto> topListings = new ArrayList<>();
        for (Object[] row : topListingsData) {
            if (topListings.size() >= 10) break;
            UUID listingId = (UUID) row[0];
            listingRepository.findById(listingId).ifPresent(listing -> {
                Long favoriteCount = favoriteRepository.countByListingId(listingId);
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
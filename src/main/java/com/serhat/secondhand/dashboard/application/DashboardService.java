package com.serhat.secondhand.dashboard.application;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.dashboard.mapper.DashboardMapper;
import com.serhat.secondhand.dashboard.application.port.*;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService implements IDashboardService {

    private final SalesStatisticsPort salesStatisticsPort;
    private final ListingStatisticsPort listingStatisticsPort;
    private final ReviewStatisticsPort reviewStatisticsPort;
    private final FavoriteStatisticsPort favoriteStatisticsPort;
    private final DashboardMapper dashboardMapper;
    private final ListingViewStatisticsPort listingViewStatisticsPort;
    private final OfferStatisticsPort offerStatisticsPort;
    @Qualifier("taskExecutor")
    private final Executor taskExecutor;

    public SellerDashboardDto getSellerDashboard(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Async Seller Dashboard starts: {}", sellerId);

        CompletableFuture<BigDecimal> revenueFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumRevenueBySellerAndDateRange(sellerId, startDate, endDate)).orElse(BigDecimal.ZERO), taskExecutor);

        CompletableFuture<List<Object[]>> revenueTrendRawFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.getDailyRevenueTrend(sellerId, startDate, endDate), taskExecutor);

        CompletableFuture<List<Object[]>> ordersByStatusFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countDistinctOrdersBySellerAndStatusGrouped(sellerId, startDate, endDate), taskExecutor);

        CompletableFuture<Long> totalListingsFuture = CompletableFuture.supplyAsync(() ->
                listingStatisticsPort.countBySellerId(sellerId), taskExecutor);

        CompletableFuture<Long> activeListingsFuture = CompletableFuture.supplyAsync(() ->
                listingStatisticsPort.countBySellerIdAndStatus(sellerId, ListingStatus.ACTIVE), taskExecutor);

        CompletableFuture<Long> inactiveListingsFuture = CompletableFuture.supplyAsync(() ->
                listingStatisticsPort.countBySellerIdAndStatus(sellerId, ListingStatus.INACTIVE), taskExecutor);

        CompletableFuture<ListingViewStatsDto> viewStatsFuture = CompletableFuture.supplyAsync(() ->
                listingViewStatisticsPort.getAggregatedViewStatisticsForSeller(sellerId, startDate, endDate), taskExecutor);

        CompletableFuture<Long> totalFavoritesFuture = CompletableFuture.supplyAsync(() ->
                favoriteStatisticsPort.countByListingSellerId(sellerId), taskExecutor);

        CompletableFuture<List<Object[]>> categoryRevenueFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.sumRevenueBySellerAndCategory(sellerId, startDate, endDate), taskExecutor);

        CompletableFuture<ReviewStatsDto> reviewStatsFuture = CompletableFuture.supplyAsync(() ->
                reviewStatisticsPort.getUserReviewStats(sellerId), taskExecutor);

        CompletableFuture<List<Object[]>> topListingsRawFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.findTopListingsByRevenue(sellerId, startDate, endDate), taskExecutor);

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime prevStart = startDate.minusDays(daysBetween);
        CompletableFuture<BigDecimal> prevRevFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumRevenueBySellerAndDateRange(sellerId, prevStart, startDate)).orElse(BigDecimal.ZERO), taskExecutor);

        CompletableFuture<List<Object[]>> categoryOrderCountRawFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersBySellerAndCategory(sellerId, startDate, endDate), taskExecutor);

        CompletableFuture<List<Object[]>> offerStatsRawFuture = CompletableFuture.supplyAsync(() ->
                offerStatisticsPort.countOffersBySellerAndStatusGrouped(sellerId, startDate, endDate), taskExecutor);

        CompletableFuture.allOf(revenueFuture, revenueTrendRawFuture, ordersByStatusFuture,
                totalListingsFuture, activeListingsFuture, inactiveListingsFuture,
                viewStatsFuture, totalFavoritesFuture, categoryRevenueFuture,
                reviewStatsFuture, topListingsRawFuture, prevRevFuture, categoryOrderCountRawFuture,
                offerStatsRawFuture).join();

        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatusFuture.join());
        long totalOrders = ordersByStatusMap.values().stream().mapToLong(Long::longValue).sum();
        long completed = ordersByStatusMap.getOrDefault("COMPLETED", 0L) + ordersByStatusMap.getOrDefault("DELIVERED", 0L);

        ReviewStatsDto reviewStats = Optional.ofNullable(reviewStatsFuture.join()).orElse(ReviewStatsDto.empty());
        long totalReviews = reviewStats.getTotalReviews() != null ? reviewStats.getTotalReviews() : 0L;
        double averageRating = reviewStats.getAverageRating() != null ? reviewStats.getAverageRating() : 0.0;

        // Process Offer Analytics
        Map<String, Long> offerStatusMap = new HashMap<>();
        long totalOffers = 0;
        long pendingOffers = 0;
        long acceptedOffers = 0;
        long rejectedOffers = 0;
        long expiredOffers = 0;
        for (Object[] row : offerStatsRawFuture.join()) {
            String status = row[0] != null ? row[0].toString() : "UNKNOWN";
            long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            offerStatusMap.put(status, count);
            totalOffers += count;
            if ("PENDING".equals(status)) pendingOffers = count;
            else if ("ACCEPTED".equals(status)) acceptedOffers = count;
            else if ("REJECTED".equals(status)) rejectedOffers = count;
            else if ("EXPIRED".equals(status)) expiredOffers = count;
        }
        long decidedOffers = acceptedOffers + rejectedOffers;
        double offerAcceptanceRate = (decidedOffers > 0) ? Math.round(((double) acceptedOffers / decidedOffers * 100.0) * 10.0) / 10.0 : 0.0;

        com.serhat.secondhand.dashboard.dto.OfferAnalyticsDto offerAnalytics = com.serhat.secondhand.dashboard.dto.OfferAnalyticsDto.builder()
                .totalOffersReceived(totalOffers)
                .pendingOffers(pendingOffers)
                .acceptedOffers(acceptedOffers)
                .rejectedOffers(rejectedOffers)
                .expiredOffers(expiredOffers)
                .acceptanceRate(offerAcceptanceRate)
                .statusCounts(offerStatusMap)
                .build();

        // Process Conversion Funnel
        long viewsCount = viewStatsFuture.join().getTotalViews();
        long favoritesCount = totalFavoritesFuture.join();
        double viewToFavRate = (viewsCount > 0) ? Math.round(((double) favoritesCount / viewsCount * 100.0) * 10.0) / 10.0 : 0.0;
        double favToOfferRate = (favoritesCount > 0) ? Math.round(((double) totalOffers / favoritesCount * 100.0) * 10.0) / 10.0 : 0.0;
        double overallConversionRate = (viewsCount > 0) ? Math.round(((double) totalOrders / viewsCount * 100.0) * 10.0) / 10.0 : 0.0;

        com.serhat.secondhand.dashboard.dto.FunnelStatsDto funnel = com.serhat.secondhand.dashboard.dto.FunnelStatsDto.builder()
                .totalViews(viewsCount)
                .totalFavorites(favoritesCount)
                .totalOffers(totalOffers)
                .totalOrders(totalOrders)
                .viewToFavoriteRate(viewToFavRate)
                .favoriteToOfferRate(favToOfferRate)
                .overallConversionRate(overallConversionRate)
                .build();

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
                .funnel(funnel)
                .offerStats(offerAnalytics)
                .categoryRevenue(dashboardMapper.mapCategoryRevenue(categoryRevenueFuture.join()))
                .topListings(processTopListings(topListingsRawFuture.join(), sellerId))
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .ratingDistribution(dashboardMapper.mapRatingDistribution(reviewStats))
                .soldListings(salesStatisticsPort.countDistinctListingsSoldBySellerAndDateRange(sellerId, startDate, endDate))
                .categoryOrderCount(dashboardMapper.mapCategoryOrderCount(categoryOrderCountRawFuture.join()))
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    public BuyerDashboardDto getBuyerDashboard(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Async Buyer Dashboard starts: {}", buyerId);

        CompletableFuture<BigDecimal> spendingFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(buyerId, startDate, endDate)).orElse(BigDecimal.ZERO), taskExecutor);

        CompletableFuture<Long> totalOrdersFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersByUserIdAndCreatedAtBetween(buyerId, startDate, endDate), taskExecutor);

        CompletableFuture<List<Object[]>> spendingTrendFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.getDailySpendingTrend(buyerId, startDate, endDate), taskExecutor);

        CompletableFuture<List<Object[]>> ordersByStatusFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersByUserIdAndStatusGrouped(buyerId, startDate, endDate), taskExecutor);

        CompletableFuture<List<Object[]>> categorySpendingFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.sumSpendingByBuyerAndCategory(buyerId, startDate, endDate), taskExecutor);

        CompletableFuture<List<Object[]>> categoryOrderCountFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.countOrdersByBuyerAndCategory(buyerId, startDate, endDate), taskExecutor);

        CompletableFuture<Long> reviewsGivenFuture = CompletableFuture.supplyAsync(() ->
                reviewStatisticsPort.countByReviewerId(buyerId), taskExecutor);

        CompletableFuture<Long> totalFavoritesFuture = CompletableFuture.supplyAsync(() ->
                favoriteStatisticsPort.countByUserId(buyerId), taskExecutor);

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime prevStart = startDate.minusDays(daysBetween);
        CompletableFuture<BigDecimal> prevSpendingFuture = CompletableFuture.supplyAsync(() ->
                Optional.ofNullable(salesStatisticsPort.sumTotalAmountByUserIdAndDateRange(buyerId, prevStart, startDate)).orElse(BigDecimal.ZERO), taskExecutor);

        CompletableFuture<List<Object[]>> buyerOffersFuture = CompletableFuture.supplyAsync(() ->
                offerStatisticsPort.countOffersByBuyerAndStatusGrouped(buyerId, startDate, endDate), taskExecutor);

        CompletableFuture<List<com.serhat.secondhand.order.entity.Order>> activeDeliveriesFuture = CompletableFuture.supplyAsync(() ->
                salesStatisticsPort.findActiveOrdersForBuyer(buyerId), taskExecutor);

        CompletableFuture<List<com.serhat.secondhand.dashboard.dto.PriceDropAlertDto>> priceDropsFuture = CompletableFuture.supplyAsync(() ->
                fetchPriceDropAlertsForBuyer(buyerId), taskExecutor);

        CompletableFuture.allOf(spendingFuture, totalOrdersFuture, spendingTrendFuture,
                ordersByStatusFuture, categorySpendingFuture, categoryOrderCountFuture,
                reviewsGivenFuture, totalFavoritesFuture, prevSpendingFuture,
                buyerOffersFuture, activeDeliveriesFuture, priceDropsFuture).join();

        Map<String, Long> ordersByStatusMap = dashboardMapper.mapStatusCounts(ordersByStatusFuture.join());
        long totalOrders = totalOrdersFuture.join();
        BigDecimal totalSpending = spendingFuture.join();

        BigDecimal avgOrderValue = (totalOrders > 0)
                ? totalSpending.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Buyer Offers Mapping
        long totalSent = 0;
        long pendingOffers = 0;
        long acceptedOffers = 0;
        long rejectedOffers = 0;
        for (Object[] row : buyerOffersFuture.join()) {
            String status = row[0] != null ? row[0].toString() : "UNKNOWN";
            long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            totalSent += count;
            if ("PENDING".equals(status)) pendingOffers = count;
            else if ("ACCEPTED".equals(status)) acceptedOffers = count;
            else if ("REJECTED".equals(status)) rejectedOffers = count;
        }

        com.serhat.secondhand.dashboard.dto.BuyerOfferStatsDto buyerOfferStats = com.serhat.secondhand.dashboard.dto.BuyerOfferStatsDto.builder()
                .totalOffersSent(totalSent)
                .pendingOffers(pendingOffers)
                .acceptedOffers(acceptedOffers)
                .rejectedOffers(rejectedOffers)
                .build();

        // Estimated Smart Savings (~18% on total purchases)
        BigDecimal totalSavings = totalSpending.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);

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
                .totalSavings(totalSavings)
                .offerStats(buyerOfferStats)
                .activeDeliveries(processActiveDeliveries(activeDeliveriesFuture.join()))
                .priceDropAlerts(priceDropsFuture.join())
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    private List<com.serhat.secondhand.dashboard.dto.ActiveDeliveryDto> processActiveDeliveries(List<com.serhat.secondhand.order.entity.Order> orders) {
        if (orders == null || orders.isEmpty()) return List.of();
        List<com.serhat.secondhand.dashboard.dto.ActiveDeliveryDto> list = new ArrayList<>();
        for (com.serhat.secondhand.order.entity.Order o : orders) {
            if (o.getOrderItems() != null && !o.getOrderItems().isEmpty()) {
                var item = o.getOrderItems().get(0);
                list.add(com.serhat.secondhand.dashboard.dto.ActiveDeliveryDto.builder()
                        .orderId(o.getId())
                        .orderNumber(o.getOrderNumber())
                        .status(o.getStatus() != null ? o.getStatus().name() : "PROCESSING")
                        .listingId(item.getListing() != null ? item.getListing().getId() : null)
                        .listingTitle(item.getListing() != null ? item.getListing().getTitle() : "Ürün")
                        .listingImageUrl(item.getListing() != null ? item.getListing().getImageUrl() : null)
                        .price(o.getTotalAmount())
                        .sellerName(item.getSeller() != null ? item.getSeller().getName() + " " + item.getSeller().getSurname() : "Satıcı")
                        .sellerId(item.getSeller() != null ? item.getSeller().getId() : null)
                        .orderDate(o.getCreatedAt())
                        .trackingNumber(o.getShipping() != null ? o.getShipping().getTrackingNumber() : null)
                        .carrierName(o.getShipping() != null ? o.getShipping().getProviderName() : null)
                        .build());
            }
        }
        return list.stream().limit(5).collect(Collectors.toList());
    }

    private List<com.serhat.secondhand.dashboard.dto.PriceDropAlertDto> fetchPriceDropAlertsForBuyer(Long buyerId) {
        List<UUID> favoriteIds = favoriteStatisticsPort.findListingIdsByUserId(buyerId);
        if (favoriteIds == null || favoriteIds.isEmpty()) return List.of();

        List<Listing> listings = listingStatisticsPort.findAllByIdIn(favoriteIds);
        List<com.serhat.secondhand.dashboard.dto.PriceDropAlertDto> alerts = new ArrayList<>();
        for (Listing l : listings) {
            if (l.getStatus() == ListingStatus.ACTIVE) {
                // If listing is active, show as watchlist highlight
                alerts.add(com.serhat.secondhand.dashboard.dto.PriceDropAlertDto.builder()
                        .listingId(l.getId())
                        .title(l.getTitle())
                        .imageUrl(l.getImageUrl())
                        .originalPrice(l.getPrice())
                        .currentPrice(l.getPrice())
                        .discountPercent(10)
                        .campaignName("Fırsat Ürünü")
                        .build());
            }
        }
        return alerts.stream().limit(4).collect(Collectors.toList());
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

        Map<UUID, ReviewStatsDto> rawReviewStats = reviewStatisticsPort.getListingReviewStatsDto(listingIds);

        // Defensive: Redis cache may deserialize UUID map keys as String,
        // causing Map.get(UUID) to miss. Normalize to String-keyed map.
        Map<String, ReviewStatsDto> reviewStatsMap = new HashMap<>();
        ((Map<?, ?>) rawReviewStats).forEach((k, v) -> reviewStatsMap.put(k.toString(), (ReviewStatsDto) v));

        // Same defensive normalization for favorites (also UUID-keyed, also cached)
        Map<String, FavoriteStatsDto> favStatsMap = new HashMap<>();
        ((Map<?, ?>) favoriteStatsMap).forEach((k, v) -> favStatsMap.put(k.toString(), (FavoriteStatsDto) v));

        return topListingsData.stream()
                .limit(10)
                .map(row -> {
                    UUID id = (UUID) row[0];
                    String idStr = id.toString();
                    Listing listing = listingMap.get(id);
                    if (listing == null) return null;

                    Long favCount = favStatsMap.getOrDefault(idStr, FavoriteStatsDto.builder().favoriteCount(0L).build()).getFavoriteCount();
                    Double avgRating = reviewStatsMap.getOrDefault(idStr, ReviewStatsDto.empty()).getAverageRating();

                    return dashboardMapper.toTopListingDto(row, listing, favCount, avgRating);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public ListingStatisticsDto getGlobalListingStatistics() {
        long totalListings = listingStatisticsPort.getTotalListingCount();
        long activeListings = listingStatisticsPort.getListingCountByStatus(ListingStatus.ACTIVE);
        long activeSellerCount = listingStatisticsPort.getActiveSellerCount(ListingStatus.ACTIVE);
        long activeCityCount = listingStatisticsPort.getActiveCityCount(ListingStatus.ACTIVE);

        long vehicleCount = 0, electronicsCount = 0, realEstateCount = 0, clothingCount = 0, booksCount = 0, sportsCount = 0;
        try {
            var rows = listingStatisticsPort.getActiveCountsByType(ListingStatus.ACTIVE);
            for (Object[] row : rows) {
                String key = row[0].toString();
                long count = ((Number) row[1]).longValue();
                switch (key) {
                    case "VEHICLE" -> vehicleCount = count;
                    case "ELECTRONICS" -> electronicsCount = count;
                    case "REAL_ESTATE" -> realEstateCount = count;
                    case "CLOTHING" -> clothingCount = count;
                    case "BOOKS" -> booksCount = count;
                    case "SPORTS" -> sportsCount = count;
                }
            }
        } catch (Exception e) {
            log.error("Failed to retrieve listing counts by type: {}", e.getMessage(), e);
        }

        return ListingStatisticsDto.builder()
                .totalListings(totalListings)
                .activeListings(activeListings)
                .activeSellerCount(activeSellerCount)
                .activeCityCount(activeCityCount)
                .vehicleCount(vehicleCount)
                .electronicsCount(electronicsCount)
                .realEstateCount(realEstateCount)
                .clothingCount(clothingCount)
                .booksCount(booksCount)
                .sportsCount(sportsCount)
                .build();
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


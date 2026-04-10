package com.serhat.secondhand.dashboard.mapper;

import com.serhat.secondhand.dashboard.dto.BuyerDashboardDto;
import com.serhat.secondhand.dashboard.dto.SellerDashboardDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
public class DashboardMapper {

    public SellerDashboardDto.RevenueDataPoint toRevenueDataPoint(LocalDate date, BigDecimal revenue) {
        return SellerDashboardDto.RevenueDataPoint.builder()
                .date(date.atStartOfDay())
                .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                .build();
    }

    public BuyerDashboardDto.SpendingDataPoint toSpendingDataPoint(LocalDate date, BigDecimal spending) {
        return BuyerDashboardDto.SpendingDataPoint.builder()
                .date(date.atStartOfDay())
                .spending(spending != null ? spending : BigDecimal.ZERO)
                .build();
    }

    public SellerDashboardDto.TopListingDto toTopListingDto(Object[] result, Listing listing, Long favoriteCount, Double averageRating) {
        UUID listingId = (UUID) result[0];
        BigDecimal revenue = (BigDecimal) result[1];
        Long orderCount = ((Number) result[2]).longValue();

        return SellerDashboardDto.TopListingDto.builder()
                .listingId(listingId.toString())
                .listingNo(listing != null ? listing.getListingNo() : "")
                .title(listing != null ? listing.getTitle() : "")
                .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .favoriteCount(favoriteCount != null ? favoriteCount : 0L)
                .averageRating(averageRating != null ? averageRating : 0.0)
                .build();
    }

    public Map<String, Long> mapStatusCounts(List<Object[]> statusCounts) {
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : statusCounts) {
            String status = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            result.put(status, count);
        }
        return result;
    }

    public Map<String, BigDecimal> mapCategoryRevenue(List<Object[]> categoryRevenue) {
        Map<String, BigDecimal> result = new HashMap<>();
        for (Object[] row : categoryRevenue) {
            String category = row[0].toString();
            BigDecimal revenue = (BigDecimal) row[1];
            result.put(category, revenue != null ? revenue : BigDecimal.ZERO);
        }
        return result;
    }

    public Map<String, Long> mapCategoryOrderCount(List<Object[]> categoryOrders) {
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : categoryOrders) {
            String category = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            result.put(category, count);
        }
        return result;
    }

    public Map<Integer, Long> mapRatingDistribution(ReviewStatsDto reviewStats) {
        Map<Integer, Long> distribution = new HashMap<>();
        if (reviewStats != null) {
            distribution.put(5, reviewStats.getFiveStarReviews() != null ? reviewStats.getFiveStarReviews() : 0L);
            distribution.put(4, reviewStats.getFourStarReviews() != null ? reviewStats.getFourStarReviews() : 0L);
            distribution.put(3, reviewStats.getThreeStarReviews() != null ? reviewStats.getThreeStarReviews() : 0L);
            distribution.put(2, reviewStats.getTwoStarReviews() != null ? reviewStats.getTwoStarReviews() : 0L);
            distribution.put(1, reviewStats.getOneStarReviews() != null ? reviewStats.getOneStarReviews() : 0L);
            distribution.put(0, reviewStats.getZeroStarReviews() != null ? reviewStats.getZeroStarReviews() : 0L);
        }
        return distribution;
    }
}


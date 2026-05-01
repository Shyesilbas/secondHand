package com.serhat.secondhand.dashboard.application.port;

import com.serhat.secondhand.review.dto.ReviewStatsDto;

public interface ReviewStatisticsPort {

    Double getUserAverageRating(Long userId);

    ReviewStatsDto getUserReviewStats(Long userId);

    long countByReviewerId(Long reviewerId);

    java.util.Map<java.util.UUID, ReviewStatsDto> getListingReviewStatsDto(java.util.List<java.util.UUID> listingIds);
}

package com.serhat.secondhand.dashboard.application.adapter;

import com.serhat.secondhand.dashboard.application.port.ReviewStatisticsPort;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.review.application.IReviewService;
import com.serhat.secondhand.review.repository.projection.ReviewStatsProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ReviewStatisticsAdapter implements ReviewStatisticsPort {

    private final ReviewRepository reviewRepository;
    private final IReviewService reviewService;

    @Override
    public Double getUserAverageRating(Long userId) {
        return reviewRepository.getUserAverageRating(userId);
    }

    @Override
    public ReviewStatsDto getUserReviewStats(Long userId) {
        ReviewStatsProjection stats = reviewRepository.getUserReviewStats(userId);
        if (stats == null) {
            return ReviewStatsDto.empty();
        }
        return new ReviewStatsDto(
                stats.getTotalReviews(),
                stats.getAverageRating(),
                stats.getFiveStarReviews(),
                stats.getFourStarReviews(),
                stats.getThreeStarReviews(),
                stats.getTwoStarReviews(),
                stats.getOneStarReviews(),
                stats.getZeroStarReviews()
        );
    }

    @Override
    public long countByReviewerId(Long reviewerId) {
        return reviewRepository.countByReviewerId(reviewerId);
    }

    @Override
    public Map<UUID, ReviewStatsDto> getListingReviewStatsDto(List<UUID> listingIds) {
        return reviewService.getListingReviewStatsDto(listingIds);
    }
}

package com.serhat.secondhand.dashboard.service.adapter;

import com.serhat.secondhand.dashboard.service.port.ReviewStatisticsPort;
import com.serhat.secondhand.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReviewStatisticsAdapter implements ReviewStatisticsPort {

    private final ReviewRepository reviewRepository;

    @Override
    public Double getUserAverageRating(Long userId) {
        return reviewRepository.getUserAverageRating(userId);
    }

    @Override
    public List<Object[]> getUserReviewStats(Long userId) {
        return reviewRepository.getUserReviewStats(userId);
    }

    @Override
    public long countByReviewerId(Long reviewerId) {
        return reviewRepository.countByReviewerId(reviewerId);
    }
}


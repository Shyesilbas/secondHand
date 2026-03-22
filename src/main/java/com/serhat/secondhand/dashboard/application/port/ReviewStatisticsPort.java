package com.serhat.secondhand.dashboard.application.port;

import java.util.List;

public interface ReviewStatisticsPort {

    Double getUserAverageRating(Long userId);

    List<Object[]> getUserReviewStats(Long userId);

    long countByReviewerId(Long reviewerId);
}


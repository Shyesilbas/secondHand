package com.serhat.secondhand.dashboard.service.port;

import java.util.List;

public interface ReviewStatisticsPort {

    Double getUserAverageRating(Long userId);

    List<Object[]> getUserReviewStats(Long userId);

    long countByReviewerId(Long reviewerId);
}


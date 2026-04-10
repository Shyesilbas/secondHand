package com.serhat.secondhand.review.repository.projection;

public interface ReviewStatsProjection {
    Long getTotalReviews();

    Double getAverageRating();

    Long getFiveStarReviews();

    Long getFourStarReviews();

    Long getThreeStarReviews();

    Long getTwoStarReviews();

    Long getOneStarReviews();

    Long getZeroStarReviews();
}

package com.serhat.secondhand.review.repository.projection;

/** Tek satırda distinct yorumcu + ortalama puan (Great Seller kuralları). */
public interface GreatSellerReviewMetrics {

    Long getDistinctReviewerCount();

    Double getAverageRating();
}

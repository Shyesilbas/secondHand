package com.serhat.secondhand.reviews.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewStatsDto {
    private Long totalReviews;
    private Double averageRating;
    private Long fiveStarReviews;
    private Long fourStarReviews;
    private Long threeStarReviews;
    private Long twoStarReviews;
    private Long oneStarReviews;
    private Long zeroStarReviews;
    
    public static ReviewStatsDto empty() {
        return new ReviewStatsDto(0L, 0.0, 0L, 0L, 0L, 0L, 0L, 0L);
    }
}

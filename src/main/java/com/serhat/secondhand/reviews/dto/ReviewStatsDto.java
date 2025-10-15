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
    private Long fiveStarCount;
    private Long fourStarCount;
    private Long threeStarCount;
    private Long twoStarCount;
    private Long oneStarCount;
    
    public static ReviewStatsDto empty() {
        return new ReviewStatsDto(0L, 0.0, 0L, 0L, 0L, 0L, 0L);
    }
}

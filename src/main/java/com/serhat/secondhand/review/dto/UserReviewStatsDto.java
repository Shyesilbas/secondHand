package com.serhat.secondhand.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReviewStatsDto {

    private Long userId;
    private String userName;
    private String userSurname;
    private Long totalReviews;
    private Double averageRating;
    private Long fiveStarReviews;
    private Long fourStarReviews;
    private Long threeStarReviews;
    private Long twoStarReviews;
    private Long oneStarReviews;
    private Long zeroStarReviews;
}

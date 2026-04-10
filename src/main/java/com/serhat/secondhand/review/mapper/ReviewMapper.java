package com.serhat.secondhand.review.mapper;

import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import com.serhat.secondhand.review.entity.Review;
import com.serhat.secondhand.review.repository.projection.ReviewStatsProjection;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewDto toDto(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewDto.builder()
                .id(review.getId())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getName())
                .reviewerSurname(review.getReviewer().getSurname())
                .reviewedUserId(review.getReviewedUser().getId())
                .reviewedUserName(review.getReviewedUser().getName())
                .reviewedUserSurname(review.getReviewedUser().getSurname())
                .orderItemId(review.getOrderItem().getId())
                .listingTitle(review.getOrderItem().getListing().getTitle())
                .listingNo(review.getOrderItem().getListing().getListingNo())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    public Review fromCreateRequest(CreateReviewRequest request, User reviewer, User reviewedUser, OrderItem orderItem) {
        return Review.builder()
                .reviewer(reviewer)
                .reviewedUser(reviewedUser)
                .orderItem(orderItem)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
    }

    public ReviewStatsDto mapToReviewStatsDto(ReviewStatsProjection stats) {
        if (stats == null) {
            return ReviewStatsDto.empty();
        }
        return new ReviewStatsDto(
                stats.getTotalReviews(),
                stats.getAverageRating() != null ? stats.getAverageRating() : 0.0,
                stats.getFiveStarReviews(),
                stats.getFourStarReviews(),
                stats.getThreeStarReviews(),
                stats.getTwoStarReviews(),
                stats.getOneStarReviews(),
                stats.getZeroStarReviews()
        );
    }

    public UserReviewStatsDto mapToUserReviewStatsDto(Long userId, String name, String surname, ReviewStatsDto stats) {
        return UserReviewStatsDto.builder()
                .userId(userId)
                .userName(name)
                .userSurname(surname)
                .totalReviews(stats.getTotalReviews())
                .averageRating(stats.getAverageRating())
                .fiveStarReviews(stats.getFiveStarReviews())
                .fourStarReviews(stats.getFourStarReviews())
                .threeStarReviews(stats.getThreeStarReviews())
                .twoStarReviews(stats.getTwoStarReviews())
                .oneStarReviews(stats.getOneStarReviews())
                .zeroStarReviews(stats.getZeroStarReviews())
                .build();
    }
}

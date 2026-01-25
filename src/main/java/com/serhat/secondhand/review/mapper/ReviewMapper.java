package com.serhat.secondhand.review.mapper;

import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import com.serhat.secondhand.review.entity.Review;
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

    public ReviewStatsDto mapToReviewStatsDto(Object[] stats, int startIndex) {
        int len = stats.length;

        return new ReviewStatsDto(
                (Long) stats[startIndex],
                (len > startIndex + 1 && stats[startIndex + 1] != null) ? (Double) stats[startIndex + 1] : 0.0, // averageRating
                (len > startIndex + 2) ? (Long) stats[startIndex + 2] : 0L, // 5 star
                (len > startIndex + 3) ? (Long) stats[startIndex + 3] : 0L, // 4 star
                (len > startIndex + 4) ? (Long) stats[startIndex + 4] : 0L, // 3 star
                (len > startIndex + 5) ? (Long) stats[startIndex + 5] : 0L, // 2 star
                (len > startIndex + 6) ? (Long) stats[startIndex + 6] : 0L, // 1 star
                (len > startIndex + 7) ? (Long) stats[startIndex + 7] : 0L  // 0 star
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

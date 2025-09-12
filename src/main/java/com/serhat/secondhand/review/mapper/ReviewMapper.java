package com.serhat.secondhand.review.mapper;

import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.entity.Review;
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
}

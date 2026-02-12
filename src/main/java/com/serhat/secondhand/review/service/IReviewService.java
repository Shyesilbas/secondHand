package com.serhat.secondhand.review.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IReviewService {
    
    Result<ReviewDto> createReview(Long reviewerId, CreateReviewRequest request);
    
    Result<Page<ReviewDto>> getReviewsForUser(Long userId, Pageable pageable);
    
    Result<Page<ReviewDto>> getReviewsByUser(Long userId, Pageable pageable);
    
    Result<UserReviewStatsDto> getUserReviewStats(Long userId);
    
    Result<ReviewDto> getReviewByOrderItem(Long orderItemId, Long reviewerId);
    
    Result<List<ReviewDto>> getReviewsByOrderItems(List<Long> orderItemIds, Long reviewerId);
    
    Result<Page<ReviewDto>> getReviewsForListing(String listingId, Pageable pageable);
    
    java.util.Map<UUID, ReviewStatsDto> getListingReviewStatsDto(List<UUID> listingIds);
    
    Result<UserReviewStatsDto> getListingReviewStats(String listingId);
}

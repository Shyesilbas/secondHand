package com.serhat.secondhand.review.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import com.serhat.secondhand.review.entity.Review;
import com.serhat.secondhand.review.mapper.ReviewMapper;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.review.util.ReviewErrorCodes;
import com.serhat.secondhand.review.validator.ReviewValidator;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserService userService;
    private final ReviewMapper reviewMapper;
    private final ListingRepository listingRepository;
    private final ReviewValidator reviewValidator;

    @Transactional
    public Result<ReviewDto> createReview(Long reviewerId, CreateReviewRequest request) {
        log.info("Creating review for order item {} by user {}", request.getOrderItemId(), reviewerId);

        var userResult = userService.findById(reviewerId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());
        User reviewer = userResult.getData();

        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId()).orElse(null);
        if (orderItem == null) return Result.error(ReviewErrorCodes.ORDER_ITEM_NOT_FOUND);

        Result<Void> validationResult = reviewValidator.validateForCreate(reviewer, orderItem);
        if (validationResult.isError()) return Result.error(validationResult.getMessage(), validationResult.getErrorCode());

        User reviewedUser = orderItem.getListing().getSeller();
        Review review = reviewMapper.fromCreateRequest(request, reviewer, reviewedUser, orderItem);

        Review savedReview = reviewRepository.save(review);
        return Result.success(reviewMapper.toDto(savedReview));
    }

    @Transactional(readOnly = true)
    public Result<Page<ReviewDto>> getReviewsForUser(Long userId, Pageable pageable) {
        log.info("Getting reviews for user: {}", userId);
        Page<Review> reviews = reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId, pageable);
        return Result.success(reviews.map(reviewMapper::toDto));
    }

    @Transactional(readOnly = true)
    public Result<Page<ReviewDto>> getReviewsByUser(Long userId, Pageable pageable) {
        log.info("Getting reviews written by user: {}", userId);
        Page<Review> reviews = reviewRepository.findByReviewerIdOrderByCreatedAtDesc(userId, pageable);
        return Result.success(reviews.map(reviewMapper::toDto));
    }

    @Transactional(readOnly = true)
    public Result<UserReviewStatsDto> getUserReviewStats(Long userId) {
        log.info("Getting review statistics for user: {}", userId);

        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());
        User user = userResult.getData();

        List<Object[]> statsList = reviewRepository.getUserReviewStats(userId);
        ReviewStatsDto stats = (statsList == null || statsList.isEmpty())
                ? ReviewStatsDto.empty()
                : reviewMapper.mapToReviewStatsDto(statsList.get(0), 0);

        return Result.success(reviewMapper.mapToUserReviewStatsDto(userId, user.getName(), user.getSurname(), stats));
    }

    @Transactional(readOnly = true)
    public Result<ReviewDto> getReviewByOrderItem(Long orderItemId, Long reviewerId) {
        log.info("Getting review for order item {} by reviewer {}", orderItemId, reviewerId);

        return reviewRepository.findByReviewerIdAndOrderItemId(reviewerId, orderItemId)
                .map(review -> Result.success(reviewMapper.toDto(review)))
                .orElse(Result.success(null));
    }

    @Transactional(readOnly = true)
    public Result<List<ReviewDto>> getReviewsByOrderItems(List<Long> orderItemIds, Long reviewerId) {
        if (orderItemIds == null || orderItemIds.isEmpty()) {
            return Result.success(List.of());
        }
        List<Review> reviews = reviewRepository.findByOrderItem_IdInAndReviewer_Id(orderItemIds, reviewerId);
        return Result.success(reviews.stream().map(reviewMapper::toDto).toList());
    }

    @Transactional(readOnly = true)
    public Result<Page<ReviewDto>> getReviewsForListing(String listingId, Pageable pageable) {
        try {
            UUID uuid = UUID.fromString(listingId);
            Page<Review> reviews = reviewRepository.findReviewsByListingId(uuid, pageable);
            return Result.success(reviews.map(reviewMapper::toDto));
        } catch (IllegalArgumentException e) {
            return Result.error(ListingErrorCodes.INVALID_LISTING_ID);
        }
    }

    @Transactional(readOnly = true)
    public Map<UUID, ReviewStatsDto> getListingReviewStatsDto(List<UUID> listingIds) {
        if (listingIds == null || listingIds.isEmpty()) return new HashMap<>();

        List<Object[]> statsList = reviewRepository.getListingReviewStats(listingIds);
        Map<UUID, ReviewStatsDto> statsMap = new HashMap<>();

        for (UUID id : listingIds) {
            statsMap.put(id, ReviewStatsDto.empty());
        }

        for (Object[] stats : statsList) {
            UUID listingId = (UUID) stats[0];
            ReviewStatsDto dto = reviewMapper.mapToReviewStatsDto(stats, 1);
            statsMap.put(listingId, dto);
        }
        return statsMap;
    }

    @Transactional(readOnly = true)
    public Result<UserReviewStatsDto> getListingReviewStats(String listingId) {
        log.info("Getting review stats for listing: {}", listingId);

        UUID uuid;
        try {
            uuid = UUID.fromString(listingId);
        } catch (IllegalArgumentException e) {
            return Result.error(ListingErrorCodes.INVALID_LISTING_ID);
        }

        Optional<Listing> listingOpt = listingRepository.findById(uuid);
        if (listingOpt.isEmpty()) {
            return Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
        }
        Listing listing = listingOpt.get();

        Map<UUID, ReviewStatsDto> statsMap = getListingReviewStatsDto(List.of(uuid));
        ReviewStatsDto stats = statsMap.getOrDefault(uuid, ReviewStatsDto.empty());

        return Result.success(reviewMapper.mapToUserReviewStatsDto(
                listing.getSeller().getId(),
                listing.getTitle(),
                "",
                stats));
    }
}
package com.serhat.secondhand.review.service;

import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import com.serhat.secondhand.review.entity.Review;
import com.serhat.secondhand.review.mapper.ReviewMapper;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserService userService;
    private final ReviewMapper reviewMapper;
    private final ListingService listingService;

    public ReviewDto createReview(User reviewer, CreateReviewRequest request) {
        log.info("Creating review for order item {} by user {}", request.getOrderItemId(), reviewer.getId());

                OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        if (!orderItem.getOrder().getUser().getId().equals(reviewer.getId())) {
            throw new RuntimeException("Order item does not belong to user");
        }

                if (orderItem.getOrder().getShippingStatus() != ShippingStatus.DELIVERED) {
            throw new RuntimeException("Can only review delivered orders");
        }

                if (reviewRepository.existsByReviewerAndOrderItem(reviewer, orderItem)) {
            throw new RuntimeException("Review already exists for this order item");
        }

                User reviewedUser = orderItem.getListing().getSeller();

                Review review = Review.builder()
                .reviewer(reviewer)
                .reviewedUser(reviewedUser)
                .orderItem(orderItem)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created with ID: {}", savedReview.getId());

        return reviewMapper.toDto(savedReview);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsForUser(Long userId, Pageable pageable) {
        log.info("Getting reviews for user: {}", userId);
        
        User user = userService.findById(userId);
        Page<Review> reviews = reviewRepository.findByReviewedUserOrderByCreatedAtDesc(user, pageable);
        return reviews.map(reviewMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsByUser(Long userId, Pageable pageable) {
        log.info("Getting reviews written by user: {}", userId);
        
        User user = userService.findById(userId);
        Page<Review> reviews = reviewRepository.findByReviewerOrderByCreatedAtDesc(user, pageable);
        return reviews.map(reviewMapper::toDto);
    }

    @Transactional(readOnly = true)
    public UserReviewStatsDto getUserReviewStats(Long userId) {
        log.info("Getting review statistics for user: {}", userId);
        
        User user = userService.findById(userId);
        List<Object[]> statsList = reviewRepository.getUserReviewStats(userId);
        
        if (statsList == null || statsList.isEmpty()) {
            return UserReviewStatsDto.builder()
                    .userId(userId)
                    .userName(user.getName())
                    .userSurname(user.getSurname())
                    .totalReviews(0L)
                    .averageRating(0.0)
                    .fiveStarReviews(0L)
                    .fourStarReviews(0L)
                    .threeStarReviews(0L)
                    .twoStarReviews(0L)
                    .oneStarReviews(0L)
                    .zeroStarReviews(0L)
                    .build();
        }

        Object[] stats = statsList.get(0);
        
        return UserReviewStatsDto.builder()
                .userId(userId)
                .userName(user.getName())
                .userSurname(user.getSurname())
                .totalReviews((Long) stats[0])
                .averageRating(stats[1] != null ? (Double) stats[1] : 0.0)
                .fiveStarReviews((Long) stats[2])
                .fourStarReviews((Long) stats[3])
                .threeStarReviews((Long) stats[4])
                .twoStarReviews((Long) stats[5])
                .oneStarReviews((Long) stats[6])
                .zeroStarReviews((Long) stats[7])
                .build();
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsForOrderItems(List<Long> orderItemIds) {
        log.info("Getting reviews for order items: {}", orderItemIds);
        
        List<OrderItem> orderItems = orderItemIds.stream()
                .map(id -> orderItemRepository.findById(id))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
        
        List<Review> reviews = reviewRepository.findByOrderItemIn(orderItems);
        return reviews.stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ReviewDto> getReviewByOrderItem(Long orderItemId, Long reviewerId) {
        log.info("Getting review for order item {} by reviewer {}", orderItemId, reviewerId);
        
        Optional<OrderItem> orderItemOpt = orderItemRepository.findById(orderItemId);
        if (orderItemOpt.isEmpty()) {
            return Optional.empty();
        }
        
        User reviewer = userService.findById(reviewerId);
        Optional<Review> review = reviewRepository.findByReviewerAndOrderItem(reviewer, orderItemOpt.get());
        return review.map(reviewMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsForListing(String listingId, Pageable pageable) {
        log.info("Getting reviews for listing: {}", listingId);
        
        UUID uuid = UUID.fromString(listingId);
        
                Page<Review> reviews = reviewRepository.findByOrderItemListingIdOrderByCreatedAtDesc(uuid, pageable);
        
        return reviews.map(reviewMapper::toDto);
    }

    @Transactional(readOnly = true)
    public UserReviewStatsDto getListingReviewStats(String listingId) {
        log.info("Getting review stats for listing: {}", listingId);
        
        UUID uuid = UUID.fromString(listingId);
        
                Optional<Listing> listing = listingService.findById(uuid);
        if (listing.isEmpty()) {
            throw new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND");
        }
        
                List<Object[]> statsList = reviewRepository.getListingReviewStats(uuid);
        
        if (statsList == null || statsList.isEmpty()) {
            return UserReviewStatsDto.builder()
                    .userId(listing.get().getSeller().getId())
                    .userName(listing.get().getTitle())                     .userSurname("")                     .totalReviews(0L)
                    .averageRating(0.0)
                    .fiveStarReviews(0L)
                    .fourStarReviews(0L)
                    .threeStarReviews(0L)
                    .twoStarReviews(0L)
                    .oneStarReviews(0L)
                    .zeroStarReviews(0L)
                    .build();
        }

        Object[] stats = statsList.get(0);
        
        return UserReviewStatsDto.builder()
                .userId(listing.get().getSeller().getId())
                .userName(listing.get().getTitle())                 .userSurname("")                 .totalReviews((Long) stats[0])
                .averageRating(stats[1] != null ? (Double) stats[1] : 0.0)
                .fiveStarReviews((Long) stats[2])
                .fourStarReviews((Long) stats[3])
                .threeStarReviews((Long) stats[4])
                .twoStarReviews((Long) stats[5])
                .oneStarReviews((Long) stats[6])
                .zeroStarReviews((Long) stats[7])
                .build();
    }
}

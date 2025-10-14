package com.serhat.secondhand.review.controller;

import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import com.serhat.secondhand.review.service.ReviewService;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ReviewDto review = reviewService.createReview(user, request);
        
        return ResponseEntity.ok(review);
    }

    @GetMapping("/user")
    public ResponseEntity<Page<ReviewDto>> getReviewsForUser(
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Page<ReviewDto> reviews = reviewService.getReviewsForUser(user.getId(), pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<Page<ReviewDto>> getReviewsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<ReviewDto> reviews = reviewService.getReviewsByUser(userId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<UserReviewStatsDto> getUserReviewStats(@PathVariable Long userId) {
        UserReviewStatsDto stats = reviewService.getUserReviewStats(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/order-items")
    public ResponseEntity<List<ReviewDto>> getReviewsForOrderItems(
            @RequestParam List<Long> orderItemIds) {
        
        List<ReviewDto> reviews = reviewService.getReviewsForOrderItems(orderItemIds);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/order-item/{orderItemId}")
    public ResponseEntity<ReviewDto> getReviewByOrderItem(
            @PathVariable Long orderItemId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        return reviewService.getReviewByOrderItem(orderItemId, user.getId())
                .map(review -> ResponseEntity.ok(review))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<Page<ReviewDto>> getReviewsForListing(
            @PathVariable String listingId,
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<ReviewDto> reviews = reviewService.getReviewsForListing(listingId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/listing/{listingId}/stats")
    public ResponseEntity<UserReviewStatsDto> getListingReviewStats(@PathVariable String listingId) {
        UserReviewStatsDto stats = reviewService.getListingReviewStats(listingId);
        return ResponseEntity.ok(stats);
    }
}

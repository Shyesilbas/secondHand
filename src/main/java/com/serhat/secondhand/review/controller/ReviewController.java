package com.serhat.secondhand.review.controller;

import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.service.ReviewService;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        var result = reviewService.createReview(user, request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/received-by/{userId}")
    public ResponseEntity<?> getReviewsReceivedByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        
        log.info("Getting reviews received by user ID: {}", userId);
        var result = reviewService.getReviewsForUser(userId, pageable);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/received")
    public ResponseEntity<?> getReviewsForUser(
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Getting reviews received by user: {}", user.getEmail());
        var result = reviewService.getReviewsForUser(user.getId(), pageable);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/written-by/{userId}")
    public ResponseEntity<?> getReviewsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        
        log.info("Getting reviews written by user ID: {}", userId);
        var result = reviewService.getReviewsByUser(userId, pageable);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/user-stats/{userId}")
    public ResponseEntity<?> getUserReviewStats(@PathVariable Long userId) {
        log.info("Getting review stats for user ID: {}", userId);
        var result = reviewService.getUserReviewStats(userId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/by-order-items")
    public ResponseEntity<?> getReviewsForOrderItems(
            @RequestParam List<Long> orderItemIds) {
        
        log.info("Getting reviews for order items: {}", orderItemIds);
        var result = reviewService.getReviewsForOrderItems(orderItemIds);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/by-order-item/{orderItemId}")
    public ResponseEntity<?> getReviewByOrderItem(
            @PathVariable Long orderItemId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        log.info("Getting review for order item: {} by user: {}", orderItemId, user.getEmail());
        var result = reviewService.getReviewByOrderItem(orderItemId, user.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/for-listing/{listingId}")
    public ResponseEntity<?> getReviewsForListing(
            @PathVariable String listingId,
            @PageableDefault(size = 10) Pageable pageable) {
        
        log.info("Getting reviews for listing: {}", listingId);
        var result = reviewService.getReviewsForListing(listingId, pageable);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/listing-stats/{listingId}")
    public ResponseEntity<?> getListingReviewStats(@PathVariable String listingId) {
        log.info("Getting review stats for listing: {}", listingId);
        var result = reviewService.getListingReviewStats(listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
}

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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("API request to create review by user: {}", currentUser.getId());
        var result = reviewService.createReview(currentUser.getId(), request);
        return handleResult(result);
    }

    @GetMapping("/received")
    public ResponseEntity<?> getMyReceivedReviews(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {

        log.info("Getting reviews received by current user: {}", currentUser.getId());
        var result = reviewService.getReviewsForUser(currentUser.getId(), pageable);
        return handleResult(result);
    }

    @GetMapping("/by-order-items")
    public ResponseEntity<?> getReviewsByOrderItems(
            @RequestParam("orderItemIds") String orderItemIdsParam,
            @AuthenticationPrincipal User currentUser) {
        List<Long> ids;
        try {
            ids = Arrays.stream(orderItemIdsParam.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .toList();
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_ORDER_ITEM_IDS", "message", "Invalid orderItemIds format"));
        }
        var result = reviewService.getReviewsByOrderItems(ids, currentUser.getId());
        return handleResult(result);
    }

    @GetMapping("/by-order-item/{orderItemId}")
    public ResponseEntity<?> getReviewByOrderItem(
            @PathVariable Long orderItemId,
            @AuthenticationPrincipal User currentUser) {

        log.info("Getting review for order item: {} by user: {}", orderItemId, currentUser.getId());
        var result = reviewService.getReviewByOrderItem(orderItemId, currentUser.getId());
        return handleResult(result);
    }

    @GetMapping("/received-by/{userId}")
    public ResponseEntity<?> getReviewsReceivedByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        var result = reviewService.getReviewsForUser(userId, pageable);
        return handleResult(result);
    }

    @GetMapping("/written-by/{userId}")
    public ResponseEntity<?> getReviewsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        var result = reviewService.getReviewsByUser(userId, pageable);
        return handleResult(result);
    }

    @GetMapping("/user-stats/{userId}")
    public ResponseEntity<?> getUserReviewStats(@PathVariable Long userId) {
        var result = reviewService.getUserReviewStats(userId);
        return handleResult(result);
    }

    @GetMapping("/for-listing/{listingId}")
    public ResponseEntity<?> getReviewsForListing(
            @PathVariable String listingId,
            @PageableDefault(size = 10) Pageable pageable) {
        var result = reviewService.getReviewsForListing(listingId, pageable);
        return handleResult(result);
    }

    @GetMapping("/listing-stats/{listingId}")
    public ResponseEntity<?> getListingReviewStats(@PathVariable String listingId) {
        var result = reviewService.getListingReviewStats(listingId);
        return handleResult(result);
    }

    private ResponseEntity<?> handleResult(com.serhat.secondhand.core.result.Result<?> result) {
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
}
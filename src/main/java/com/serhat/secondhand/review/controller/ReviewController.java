package com.serhat.secondhand.review.controller;

import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.service.IReviewService;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private final IReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("API request to create review by user: {}", currentUser.getId());
        var result = reviewService.createReview(currentUser.getId(), request);
        return handleResult(result);
    }

    @GetMapping
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

    private ResponseEntity<?> handleResult(com.serhat.secondhand.core.result.Result<?> result) {
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
}
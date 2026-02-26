package com.serhat.secondhand.review.controller;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.ResultResponses;
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
        return ResultResponses.ok(reviewService.createReview(currentUser.getId(), request));
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
            throw new BusinessException("Invalid orderItemIds format", HttpStatus.BAD_REQUEST, "INVALID_ORDER_ITEM_IDS");
        }
        return ResultResponses.ok(reviewService.getReviewsByOrderItems(ids, currentUser.getId()));
    }
}
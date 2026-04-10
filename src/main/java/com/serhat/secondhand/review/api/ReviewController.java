package com.serhat.secondhand.review.api;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.review.dto.CreateReviewRequest;
import com.serhat.secondhand.review.application.IReviewService;
import com.serhat.secondhand.review.util.ReviewErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private static final int MAX_ORDER_ITEM_IDS = 100;

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
        if (orderItemIdsParam == null || orderItemIdsParam.isBlank()) {
            throw new BusinessException(ReviewErrorCodes.INVALID_ORDER_ITEM_IDS);
        }

        List<Long> ids;
        try {
            ids = Arrays.stream(orderItemIdsParam.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .toList();
        } catch (NumberFormatException e) {
            throw new BusinessException(ReviewErrorCodes.INVALID_ORDER_ITEM_IDS);
        }

        if (ids.isEmpty()) {
            throw new BusinessException(ReviewErrorCodes.INVALID_ORDER_ITEM_IDS);
        }
        if (ids.size() > MAX_ORDER_ITEM_IDS) {
            throw new BusinessException(ReviewErrorCodes.TOO_MANY_ORDER_ITEM_IDS);
        }

        return ResultResponses.ok(reviewService.getReviewsByOrderItems(ids, currentUser.getId()));
    }
}

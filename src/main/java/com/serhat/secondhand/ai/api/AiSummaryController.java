package com.serhat.secondhand.ai.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;

import com.serhat.secondhand.ai.application.AiSummaryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai/summary")
@RequiredArgsConstructor
@Tag(name = "AI Summary", description = "AI-powered review summarization operations")
public class AiSummaryController {

    private final AiSummaryService aiSummaryService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserSummary(@PathVariable Long userId) {
        return ResultResponses.ok(Result.success(aiSummaryService.getUserReviewsSummary(userId)));
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<?> getListingSummary(@PathVariable UUID listingId) {
        return ResultResponses.ok(Result.success(aiSummaryService.getListingReviewsSummary(listingId)));
    }
}

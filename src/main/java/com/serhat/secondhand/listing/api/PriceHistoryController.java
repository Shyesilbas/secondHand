package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;

import com.serhat.secondhand.listing.application.common.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.PriceHistoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/price-history")
@RequiredArgsConstructor
@Tag(name = "Price History", description = "Price History operations")
public class PriceHistoryController {

    private final PriceHistoryService priceHistoryService;

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<?> getPriceHistory(@PathVariable UUID listingId) {
        List<PriceHistoryDto> priceHistory = priceHistoryService.getPriceHistoryByListingId(listingId);
        return ResultResponses.ok(Result.success(priceHistory));
    }

    @GetMapping("/listing/{listingId}/latest")
    public ResponseEntity<?> getLatestPriceChange(@PathVariable UUID listingId) {
        PriceHistoryDto latestChange = priceHistoryService.getLatestPriceChange(listingId);
        if (latestChange == null) {
            return ResponseEntity.notFound().build();
        }
        return ResultResponses.ok(Result.success(latestChange));
    }

    @GetMapping("/listing/{listingId}/exists")
    public ResponseEntity<?> hasPriceHistory(@PathVariable UUID listingId) {
        boolean hasHistory = priceHistoryService.hasPriceHistory(listingId);
        return ResultResponses.ok(Result.success(hasHistory));
    }
}

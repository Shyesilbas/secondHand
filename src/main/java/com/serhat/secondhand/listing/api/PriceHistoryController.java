package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.listing.application.common.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.PriceHistoryDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/price-history")
@RequiredArgsConstructor
@Tag(name = "Price History", description = "Price History operations")
public class PriceHistoryController {

    private final PriceHistoryService priceHistoryService;

    @GetMapping("/listing/{listing-id}")
    public ResponseEntity<?> getPriceHistory(@PathVariable("listing-id") UUID listingId) {
        List<PriceHistoryDto> priceHistory = priceHistoryService.getPriceHistoryByListingId(listingId);
        return ResultResponses.ok(Result.success(priceHistory));
    }

    @GetMapping("/listing/{listing-id}/latest")
    public ResponseEntity<?> getLatestPriceChange(@PathVariable("listing-id") UUID listingId) {
        PriceHistoryDto latestChange = priceHistoryService.getLatestPriceChange(listingId);
        if (latestChange == null) {
            return ResponseEntity.notFound().build();
        }
        return ResultResponses.ok(Result.success(latestChange));
    }

    @GetMapping("/listing/{listing-id}/exists")
    public ResponseEntity<?> hasPriceHistory(@PathVariable("listing-id") UUID listingId) {
        boolean hasHistory = priceHistoryService.hasPriceHistory(listingId);
        return ResultResponses.ok(Result.success(hasHistory));
    }
}

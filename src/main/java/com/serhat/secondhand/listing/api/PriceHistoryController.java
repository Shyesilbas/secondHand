package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.PriceHistoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/price-history")
@RequiredArgsConstructor
public class PriceHistoryController {

    private final PriceHistoryService priceHistoryService;

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<PriceHistoryDto>> getPriceHistory(@PathVariable UUID listingId) {
        List<PriceHistoryDto> priceHistory = priceHistoryService.getPriceHistoryByListingId(listingId);
        return ResponseEntity.ok(priceHistory);
    }

    @GetMapping("/listing/{listingId}/latest")
    public ResponseEntity<PriceHistoryDto> getLatestPriceChange(@PathVariable UUID listingId) {
        PriceHistoryDto latestChange = priceHistoryService.getLatestPriceChange(listingId);
        if (latestChange == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(latestChange);
    }

    @GetMapping("/listing/{listingId}/exists")
    public ResponseEntity<Boolean> hasPriceHistory(@PathVariable UUID listingId) {
        boolean hasHistory = priceHistoryService.hasPriceHistory(listingId);
        return ResponseEntity.ok(hasHistory);
    }
}

package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.ListingViewService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.review.service.ReviewService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Listing Management", description = "General listing operations")
public class ListingController {

    private final ListingService listingService;
    private final ListingViewService listingViewService;
    private final ReviewService reviewService;

    @GetMapping("/{id}")
    public ResponseEntity<ListingDto> getListingById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;

        return listingService.findByIdAsDto(id, userId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{listingId}/reviews")
    public ResponseEntity<?> getReviewsForListing(
            @PathVariable String listingId,
            @PageableDefault(size = 10) Pageable pageable) {
        var result = reviewService.getReviewsForListing(listingId, pageable);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/{listingId}/review-stats")
    public ResponseEntity<?> getListingReviewStats(@PathVariable String listingId) {
        var result = reviewService.getListingReviewStats(listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/bulk")
    @Operation(summary = "Get listings by IDs")
    public ResponseEntity<List<ListingDto>> getListingsByIds(
            @RequestBody List<UUID> ids,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingService.findByIds(ids, userId));
    }

    @PostMapping("/filter")
    public ResponseEntity<Page<ListingDto>> getListingsWithFilters(
            @RequestBody ListingFilterDto filters,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @AuthenticationPrincipal User currentUser) {

        filters.setPage(page != null ? page : (filters.getPage() != null ? filters.getPage() : 0));
        filters.setSize(size != null ? size : (filters.getSize() != null ? filters.getSize() : 10));

        return ResponseEntity.ok(listingService.filterByCategory(filters, currentUser.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ListingDto>> globalSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingService.globalSearch(query, page, size, userId));
    }

    @GetMapping("/my-listings")
    public ResponseEntity<Page<ListingDto>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ListingType listingType,
            @AuthenticationPrincipal User currentUser) {

        Page<ListingDto> myListings = listingType != null
                ? listingService.getMyListings(currentUser.getId(), page, size, listingType)
                : listingService.getMyListings(currentUser.getId(), page, size);
        return ResponseEntity.ok(myListings);
    }

    @GetMapping("/my-listings/status/{status}")
    public ResponseEntity<List<ListingDto>> getMyListingsByStatus(
            @PathVariable ListingStatus status,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(listingService.getMyListingsByStatus(currentUser.getId(), status));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<Void> publishListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.publish(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.reactivate(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.deactivate(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        Result<Void> result = listingService.deleteListing(id, currentUser.getId());
        return handleResult(result);
    }

    @GetMapping("/my-listings/view-stats")
    public ResponseEntity<ListingViewStatsDto> getMyListingsViewStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal User currentUser) {

        if (endDate == null) endDate = LocalDateTime.now();
        if (startDate == null) startDate = endDate.minusDays(7);

        return ResponseEntity.ok(listingViewService.getAggregatedViewStatisticsForSeller(currentUser.getId(), startDate, endDate));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ListingStatisticsDto> getListingStatistics() {
        return ResponseEntity.ok(listingService.getListingStatistics());
    }

    @PutMapping("/{id}/mark-sold")
    public ResponseEntity<Void> markListingAsSold(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.markAsSold(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ListingDto>> getListingsByStatus(@PathVariable ListingStatus status) {
        return ResponseEntity.ok(listingService.findByStatusAsDto(status));
    }

    private ResponseEntity<?> handleResult(Result<?> result) {
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", result.getMessage(), "errorCode", result.getErrorCode()));
        }
        return ResponseEntity.noContent().build();
    }
}
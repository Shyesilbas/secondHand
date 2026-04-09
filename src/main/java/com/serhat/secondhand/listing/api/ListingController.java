package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.listing.application.common.ListingCommandService;
import com.serhat.secondhand.listing.application.common.ListingFeePaymentService;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.application.common.ListingViewService;
import com.serhat.secondhand.listing.application.query.ListingSearchService;
import com.serhat.secondhand.listing.application.query.ListingStatisticsService;
import com.serhat.secondhand.listing.domain.dto.request.listing.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.listing.domain.dto.request.UpdateBatchPriceRequest;
import com.serhat.secondhand.listing.domain.dto.request.UpdateBatchQuantityRequest;
import com.serhat.secondhand.listing.domain.dto.request.UpdatePriceRequest;
import com.serhat.secondhand.listing.domain.dto.request.UpdateQuantityRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.review.application.IReviewService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Listing Management", description = "General listing operations")
public class ListingController {

    private final ListingQueryService listingQueryService;
    private final ListingSearchService listingSearchService;
    private final ListingStatisticsService listingStatisticsService;
    private final ListingCommandService listingCommandService;
    private final ListingViewService listingViewService;
    private final IReviewService reviewService;
    private final ListingFeePaymentService listingFeePaymentService;

    @GetMapping("/{id}")
    public ResponseEntity<ListingDto> getListingById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return listingQueryService.findByIdAsDto(id, userId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{listingId}/reviews")
    public ResponseEntity<?> getReviewsForListing(
            @PathVariable String listingId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResultResponses.ok(reviewService.getReviewsForListing(listingId, pageable));
    }

    @GetMapping("/{listingId}/review-stats")
    public ResponseEntity<?> getListingReviewStats(@PathVariable String listingId) {
        return ResultResponses.ok(reviewService.getListingReviewStats(listingId));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Get listings by IDs")
    public ResponseEntity<List<ListingDto>> getListingsByIds(
            @Valid @RequestBody List<UUID> ids,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingQueryService.findByIds(ids, userId));
    }

    @PostMapping("/filter")
    public ResponseEntity<Page<ListingDto>> getListingsWithFilters(
            @Valid @RequestBody ListingFilterDto filters,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @AuthenticationPrincipal User currentUser) {
        filters.setPage(page != null ? page : (filters.getPage() != null ? filters.getPage() : 0));
        filters.setSize(size != null ? size : (filters.getSize() != null ? filters.getSize() : 10));
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingSearchService.filterByCategory(filters, userId));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ListingDto>> globalSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingSearchService.globalSearch(query, page, size, userId));
    }

    @GetMapping("/my-listings")
    public ResponseEntity<Page<ListingDto>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ListingType listingType,
            @AuthenticationPrincipal User currentUser) {
        Page<ListingDto> myListings = listingType != null
                ? listingQueryService.getMyListings(currentUser.getId(), page, size, listingType)
                : listingQueryService.getMyListings(currentUser.getId(), page, size);
        return ResponseEntity.ok(myListings);
    }

    @GetMapping("/my-listings/status/{status}")
    public ResponseEntity<Page<ListingDto>> getMyListingsByStatus(
            @PathVariable ListingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(listingQueryService.getMyListingsByStatus(currentUser.getId(), status, page, size));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<Void> publishListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingCommandService.publish(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingCommandService.reactivate(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingCommandService.deactivate(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.deleteListing(id, currentUser.getId()));
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
        return ResponseEntity.ok(listingStatisticsService.getGlobalListingStatistics());
    }

    @PutMapping("/{id}/mark-sold")
    public ResponseEntity<Void> markListingAsSold(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingCommandService.markAsSold(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/quantity")
    public ResponseEntity<?> updateQuantity(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateQuantityRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateSingleQuantity(id, request.quantity(), currentUser.getId()));
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<?> updatePrice(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePriceRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateSinglePrice(id, request.price(), currentUser.getId()));
    }

    @PutMapping("/quantity/batch")
    public ResponseEntity<?> updateBatchQuantity(
            @Valid @RequestBody UpdateBatchQuantityRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateBatchQuantity(request.listingIds(), request.quantity(), currentUser.getId()));
    }

    @PutMapping("/price/batch")
    public ResponseEntity<?> updateBatchPrice(
            @Valid @RequestBody UpdateBatchPriceRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateBatchPrice(request.listingIds(), request.price(), currentUser.getId()));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ListingDto>> getListingsByStatus(@PathVariable ListingStatus status) {
        return ResponseEntity.ok(listingQueryService.findByStatusAsDto(status));
    }

    @PostMapping("/pay-fee")
    @Operation(summary = "Pay listing creation fee", description = "Processes payment for listing creation fee.")
    public ResponseEntity<?> payListingCreationFee(
            @Valid @RequestBody ListingFeePaymentRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("Processing listing fee payment for user ID {}", currentUser.getId());
        return ResultResponses.created(listingFeePaymentService.payListingCreationFee(currentUser.getId(), request));
    }

    @GetMapping("/fee-config")
    @Operation(summary = "Get listing fee configuration")
    public ResponseEntity<ListingFeeConfigDto> getListingFeeConfig() {
        return ResponseEntity.ok(listingFeePaymentService.getListingFeeConfig());
    }
}

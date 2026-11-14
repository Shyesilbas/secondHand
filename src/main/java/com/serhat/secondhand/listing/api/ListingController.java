package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.application.common.ListingCommandService;
import com.serhat.secondhand.listing.application.common.ListingFeePaymentService;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.application.common.ListingViewService;
import com.serhat.secondhand.listing.application.query.ListingSearchService;
import com.serhat.secondhand.listing.application.query.ListingStatisticsService;
import com.serhat.secondhand.listing.domain.dto.request.listing.ListingFeePaymentRequest;
import com.serhat.secondhand.listing.domain.dto.request.UpdateBatchPriceRequest;
import com.serhat.secondhand.listing.domain.dto.request.UpdateBatchQuantityRequest;
import com.serhat.secondhand.listing.domain.dto.request.UpdatePriceRequest;
import com.serhat.secondhand.listing.domain.dto.request.UpdateQuantityRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeeQuoteDto;
import com.serhat.secondhand.review.application.IReviewService;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Listing Management", description = "General listing operations")
public class ListingController {

    private final ListingQueryService listingQueryService;
    private final ListingSearchService listingSearchService;
    private final ListingStatisticsService listingStatisticsService;
    private final ListingCommandService listingCommandService;
    private final ListingViewService listingViewService;
    private final IReviewService reviewService;
    private final ListingFeePaymentService listingFeePaymentService;

    @PublicEndpoint
    @GetMapping("/{id}")
    public ResponseEntity<ListingDto> getListingById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return listingQueryService.findByIdAsDto(id, userId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PublicEndpoint
    @GetMapping("/{listing-id}/reviews")
    public ResponseEntity<Page<ReviewDto>> getReviewsForListing(
            @PathVariable("listing-id") String listingId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResultResponses.ok(reviewService.getReviewsForListing(listingId, pageable));
    }

    @PublicEndpoint
    @GetMapping("/{listing-id}/review-stats")
    public ResponseEntity<UserReviewStatsDto> getListingReviewStats(@PathVariable("listing-id") String listingId) {
        return ResultResponses.ok(reviewService.getListingReviewStats(listingId));
    }

    @PublicEndpoint
    @PostMapping("/bulks")
    @Operation(summary = "Get listings by IDs")
    public ResponseEntity<List<ListingDto>> getListingsByIds(
            @NotNull @Size(max = com.serhat.secondhand.listing.util.ListingBusinessConstants.MAX_BULK_LISTING_IDS)
            @RequestBody List<@NotNull UUID> ids,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResultResponses.ok(Result.success(listingQueryService.findByIds(ids, userId)));
    }

    @PublicEndpoint
    @PostMapping("/filter")
    public ResponseEntity<Page<ListingDto>> getListingsWithFilters(
            @Valid @RequestBody ListingFilterDto filters,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @AuthenticationPrincipal User currentUser) {
        filters.setPage(page != null ? page : (filters.getPage() != null ? filters.getPage() : 0));
        filters.setSize(size != null ? size : (filters.getSize() != null ? filters.getSize() : 10));
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResultResponses.ok(Result.success(listingSearchService.filterByCategory(filters, userId)));
    }

    @PublicEndpoint
    @GetMapping("/search")
    public ResponseEntity<Page<ListingDto>> globalSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") @jakarta.validation.constraints.Min(0) int page,
            @RequestParam(defaultValue = "8") @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(100) int size,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResultResponses.ok(Result.success(listingSearchService.globalSearch(query, page, size, userId)));
    }

    @PublicEndpoint
    @GetMapping("/search/listing-no/{no}")
    public ResponseEntity<ListingDto> getListingByNo(
            @PathVariable String no,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return listingQueryService.findByListingNoAsDto(no, userId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ListingDto>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ListingType listingType,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) ListingStatus status,
            @AuthenticationPrincipal User currentUser) {
        Page<ListingDto> myListings = listingQueryService.getMyListings(
                currentUser.getId(), page, size, status, listingType, title);
        return ResultResponses.ok(Result.success(myListings));
    }

    @GetMapping("/my/status/{status}")
    public ResponseEntity<Page<ListingDto>> getMyListingsByStatus(
            @PathVariable ListingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(Result.success(listingQueryService.getMyListingsByStatus(currentUser.getId(), status, page, size)));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<Void> publishListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.publish(id, currentUser.getId()));
    }

    @PostMapping("/{id}/relist")
    public ResponseEntity<UUID> relistListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.created(listingCommandService.relist(id, currentUser.getId()));
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.reactivate(id, currentUser.getId()));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.deactivate(id, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.deleteListing(id, currentUser.getId()));
    }

    @GetMapping("/my/view-stats")
    public ResponseEntity<ListingViewStatsDto> getMyListingsViewStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal User currentUser) {
        if (endDate == null) endDate = LocalDateTime.now();
        if (startDate == null) startDate = endDate.minusDays(7);
        return ResultResponses.ok(Result.success(listingViewService.getAggregatedViewStatisticsForSeller(currentUser.getId(), startDate, endDate)));
    }

    @PublicEndpoint
    @GetMapping("/statistics")
    public ResponseEntity<ListingStatisticsDto> getListingStatistics() {
        return ResultResponses.ok(Result.success(listingStatisticsService.getGlobalListingStatistics()));
    }

    @PutMapping("/{id}/mark-sold")
    public ResponseEntity<Void> markListingAsSold(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.markAsSold(id, currentUser.getId()));
    }

    @PutMapping("/{id}/quantity")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateQuantityRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateSingleQuantity(id, request.quantity(), currentUser.getId()));
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<Void> updatePrice(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePriceRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateSinglePrice(id, request.price(), currentUser.getId()));
    }

    @PutMapping("/quantity/batch")
    public ResponseEntity<Void> updateBatchQuantity(
            @Valid @RequestBody UpdateBatchQuantityRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateBatchQuantity(request.listingIds(), request.quantity(), currentUser.getId()));
    }

    @PutMapping("/price/batch")
    public ResponseEntity<Void> updateBatchPrice(
            @Valid @RequestBody UpdateBatchPriceRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(listingCommandService.updateBatchPrice(request.listingIds(), request.price(), currentUser.getId()));
    }

    @PublicEndpoint
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<ListingDto>> getListingsByStatus(
            @PathVariable ListingStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResultResponses.ok(listingQueryService.findByStatusAsDto(status, pageable));
    }

    @PostMapping("/pay-fee")
    @Operation(summary = "Pay listing creation fee", description = "Processes payment for listing creation fee.")
    public ResponseEntity<UUID> payListingCreationFee(
            @Valid @RequestBody ListingFeePaymentRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("Processing listing fee payment for user ID {}", currentUser.getId());
        return ResultResponses.created(listingFeePaymentService.payListingCreationFee(currentUser.getId(), request));
    }

    @GetMapping("/fee-quote")
    @Operation(summary = "Get the listing fee and whether the caller's eWallet covers it")
    public ResponseEntity<ListingFeeQuoteDto> getListingFeeQuote(@AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(Result.success(listingFeePaymentService.getListingFeeQuote(currentUser.getId())));
    }

    @PublicEndpoint
    @GetMapping("/fee-config")
    @Operation(summary = "Get listing fee configuration")
    public ResponseEntity<ListingFeeConfigDto> getListingFeeConfig() {
        return ResultResponses.ok(Result.success(listingFeePaymentService.getListingFeeConfig()));
    }
}

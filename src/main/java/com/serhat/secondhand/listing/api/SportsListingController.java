package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.sports.SportsListingService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sports Listings", description = "Sports listing CRUD operations and search")
public class SportsListingController {

    private final SportsListingService sportsListingService;

    @PostMapping("/create-listing")
    @Operation(summary = "Create a new sports listing")
    public ResponseEntity<?> createSportsListing(
            @Valid @RequestBody SportsCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to create sports listing by user: {}", currentUser.getId());

        var result = sportsListingService.createSportsListing(request, currentUser.getId());

        if (result.isError()) {
            return buildErrorResponse(result);
        }

        URI location = URI.create("/api/v1/sports/" + result.getData());
        return ResponseEntity.created(location).body(Map.of("id", result.getData()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a sports listing")
    public ResponseEntity<?> updateSportsListing(
            @PathVariable UUID id,
            @Valid @RequestBody SportsUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to update sports listing: {} by user: {}", id, currentUser.getId());

        var result = sportsListingService.updateSportsListing(id, request, currentUser.getId());

        if (result.isError()) {
            return buildErrorResponse(result);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sports listing details")
    public ResponseEntity<SportsListingDto> getSportsDetails(@PathVariable UUID id) {
        SportsListingDto dto = sportsListingService.getSportsDetails(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter sports listings")
    public ResponseEntity<Page<ListingDto>> filterSports(@RequestBody SportsListingFilterDto filters) {
        Page<ListingDto> page = sportsListingService.filterSports(filters);
        return ResponseEntity.ok(page);
    }


    private ResponseEntity<?> buildErrorResponse(com.serhat.secondhand.core.result.Result<?> result) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message", result.getMessage() != null ? result.getMessage() : "Unexpected error",
                        "error", result.getErrorCode() != null ? result.getErrorCode() : "ERROR"
                ));
    }
}
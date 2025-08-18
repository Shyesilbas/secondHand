package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.SportsListingService;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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
    public ResponseEntity<Void> createSportsListing(
            @Valid @RequestBody SportsCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        UUID id = sportsListingService.createSportsListing(request, currentUser);
        URI location = URI.create("/api/v1/sports/" + id);
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a sports listing")
    public ResponseEntity<Void> updateSportsListing(
            @PathVariable UUID id,
            @Valid @RequestBody SportsUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        sportsListingService.updateSportsListing(id, request, currentUser);
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
}



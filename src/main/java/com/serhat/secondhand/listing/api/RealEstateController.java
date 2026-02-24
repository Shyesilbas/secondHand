package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.realestate.RealEstateListingService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/realEstates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Real Estate Listings", description = "Real estate listing operations")
public class RealEstateController {

    private final RealEstateListingService realEstateListingService;

    @PostMapping("/create-listing")
    @Operation(summary = "Create a new real estate listing")
    public ResponseEntity<?> createRealEstateListing(
            @Valid @RequestBody RealEstateCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to create real estate listing by user: {}", currentUser.getId());

        var result = realEstateListingService.createRealEstateListing(request, currentUser.getId());

        if (result.isError()) {
            return ResultResponses.ok(result);
        }

        URI location = URI.create("/api/v1/realEstates/" + result.getData());
        return ResponseEntity.created(location).body(Map.of("id", result.getData()));
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter Real Estate listings")
    public ResponseEntity<Page<ListingDto>> filterRealEstates(@RequestBody RealEstateFilterDto filters) {
        log.info("Filtering real estate with criteria: {}", filters);
        Page<ListingDto> result = realEstateListingService.filterRealEstate(filters);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a real estate listing")
    public ResponseEntity<?> updateRealEstateListing(
            @PathVariable UUID id,
            @Valid @RequestBody RealEstateUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to update real estate listing: {} by user: {}", id, currentUser.getId());

        return ResultResponses.ok(realEstateListingService.updateRealEstateListing(id, request, currentUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get real estate listing details")
    public ResponseEntity<RealEstateListingDto> getRealEstateDetails(@PathVariable UUID id) {
        RealEstateListingDto realEstateListingDto = realEstateListingService.getRealEstateDetails(id);
        return ResponseEntity.ok(realEstateListingDto);
    }
}
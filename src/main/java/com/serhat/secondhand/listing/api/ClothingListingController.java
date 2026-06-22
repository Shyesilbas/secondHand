package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.api.support.CategoryListingControllerSupport;
import com.serhat.secondhand.listing.application.clothing.ClothingListingService;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clothing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Clothing Listings", description = "Clothing listing operations")
public class ClothingListingController {

    private final ClothingListingService clothingListingService;

    @PostMapping("/create-listing")
    @Operation(summary = "Create a new clothing listing")
    public ResponseEntity<?> createClothingListing(
            @Valid @RequestBody ClothingCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to create clothing listing by user: {}", currentUser.getId());
        var result = clothingListingService.createClothingListing(request, currentUser.getId());
        return CategoryListingControllerSupport.buildCreateResponse(result, "/api/v1/clothing");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a clothing listing")
    public ResponseEntity<?> updateClothingListing(
            @PathVariable UUID id,
            @Valid @RequestBody ClothingUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to update clothing listing: {} by user: {}", id, currentUser.getId());

        return ResultResponses.ok(clothingListingService.updateClothingListing(id, request, currentUser.getId()));
    }

    @PublicEndpoint
    @GetMapping("/{id}")
    @Operation(summary = "Get clothing listing details")
    public ResponseEntity<?> getClothingDetails(@PathVariable UUID id) {
        ClothingListingDto clothing = clothingListingService.getClothingDetails(id);
        return ResultResponses.ok(Result.success(clothing));
    }

    @PublicEndpoint
    @GetMapping("/brands/{brand-id}/types/{clothing-type-id}")
    @Operation(summary = "Find clothing by brand and type")
    public ResponseEntity<?> findByBrandAndClothingType(
            @PathVariable("brand-id") UUID brand,
            @PathVariable("clothing-type-id") UUID clothingType,
            Pageable pageable) {
        Page<ClothingListingDto> clothing = clothingListingService.findByBrandAndClothingType(brand, clothingType, pageable);
        return ResultResponses.ok(Result.success(clothing));
    }

    @PublicEndpoint
    @PostMapping("/filter")
    @Operation(summary = "Filter clothing listings with advanced criteria")
    public ResponseEntity<?> filterClothing(@RequestBody ClothingListingFilterDto filters) {
        log.info("Filtering clothing with criteria: {}", filters);
        Page<ListingDto> result = clothingListingService.filterClothing(filters);
        return ResultResponses.ok(Result.success(result));
    }
}
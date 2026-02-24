package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.ResultResponses;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
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

        if (result.isError()) {
            return ResultResponses.ok(result);
        }

        URI location = URI.create("/api/v1/clothing/" + result.getData());
        return ResponseEntity.created(location).body(Map.of("id", result.getData()));
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

    @GetMapping("/{id}")
    @Operation(summary = "Get clothing listing details")
    public ResponseEntity<ClothingListingDto> getClothingDetails(@PathVariable UUID id) {
        ClothingListingDto clothing = clothingListingService.getClothingDetails(id);
        return ResponseEntity.ok(clothing);
    }

    @GetMapping("/brand/{brand}/type/{clothingType}")
    @Operation(summary = "Find clothing by brand and type")
    public ResponseEntity<List<ClothingListingDto>> findByBrandAndClothingType(
            @PathVariable UUID brand,
            @PathVariable UUID clothingType) {
        List<ClothingListingDto> clothing = clothingListingService.findByBrandAndClothingType(brand, clothingType);
        return ResponseEntity.ok(clothing);
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter clothing listings with advanced criteria")
    public ResponseEntity<Page<ListingDto>> filterClothing(@RequestBody ClothingListingFilterDto filters) {
        log.info("Filtering clothing with criteria: {}", filters);
        Page<ListingDto> result = clothingListingService.filterClothing(filters);
        return ResponseEntity.ok(result);
    }
}
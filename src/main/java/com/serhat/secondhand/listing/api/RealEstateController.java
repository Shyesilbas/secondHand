package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.realestate.RealEstateListingService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/v1/realEstates")
@RequiredArgsConstructor
@Slf4j
public class RealEstateController {

    private final RealEstateListingService realEstateListingService;

    @PostMapping("/create-listing")
    @Operation(summary = "Create a new real estate listing")
    public ResponseEntity<Void> createElectronicListings(
            @Valid @RequestBody RealEstateCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        UUID realEstateId = realEstateListingService.createRealEstateListing(request, currentUser);
        URI location = URI.create("/api/v1/realEstates/" + realEstateId);
        return ResponseEntity.created(location).build();
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter Real Estate listings with advanced criteria")
    public ResponseEntity<Page<ListingDto>> filterRealEstates(@RequestBody RealEstateFilterDto filters) {
        log.info("Filtering real estate with criteria: {}", filters);
        Page<ListingDto> result = realEstateListingService.filterRealEstate(filters);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a real estate listing")
    public ResponseEntity<Void> updateRealEstateListing(
            @PathVariable UUID id,
            @Valid @RequestBody RealEstateUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        realEstateListingService.updateRealEstateListing(id, request, currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get real estate listing details")
    public ResponseEntity<RealEstateListingDto> getRealEstateDetails(@PathVariable UUID id) {
        RealEstateListingDto realEstateListingDto = realEstateListingService.getRealEstateDetails(id);
        return ResponseEntity.ok(realEstateListingDto);
    }
}

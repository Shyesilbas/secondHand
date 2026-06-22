package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.api.support.CategoryListingControllerSupport;
import com.serhat.secondhand.listing.application.electronics.ElectronicListingService;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
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
@RequestMapping("/api/v1/electronics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Electronic Listings", description = "Electronic listing operations")
public class ElectronicListingController {

    private final ElectronicListingService electronicListingService;

    @PostMapping("/create-listing")
    @Operation(summary = "Create a new electronic listing")
    public ResponseEntity<?> createElectronicListings(
            @Valid @RequestBody ElectronicCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Creating electronic listing for user: {}", currentUser.getId());
        var result = electronicListingService.createElectronicListing(request, currentUser.getId());
        return CategoryListingControllerSupport.buildCreateResponse(result, "/api/v1/electronics");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a electronic listing")
    public ResponseEntity<?> updateElectronicListing(
            @PathVariable UUID id,
            @Valid @RequestBody ElectronicUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Updating electronic listing: {} by user: {}", id, currentUser.getId());

        return ResultResponses.ok(electronicListingService.updateElectronicListings(id, request, currentUser.getId()));
    }

    @PublicEndpoint
    @GetMapping("/{id}")
    @Operation(summary = "Get electronic listing details")
    public ResponseEntity<?> getElectronicDetails(@PathVariable UUID id) {
        ElectronicListingDto electronic = electronicListingService.getElectronicDetails(id);
        return ResultResponses.ok(Result.success(electronic));
    }

    @PublicEndpoint
    @GetMapping("/electronic-types/{electronic-type-id}")
    @Operation(summary = "Find electronics by type")
    public ResponseEntity<?> findByElectronicType(
            @PathVariable("electronic-type-id") UUID electronicType,
            Pageable pageable) {
        Page<ElectronicListingDto> electronicDto = electronicListingService.findByElectronicType(electronicType, pageable);
        return ResultResponses.ok(Result.success(electronicDto));
    }

    @PublicEndpoint
    @PostMapping("/filter")
    @Operation(summary = "Filter electronics listings with advanced criteria")
    public ResponseEntity<?> filterElectronics(@RequestBody ElectronicListingFilterDto filters) {
        log.info("Filtering electronics with criteria: {}", filters);
        Page<ListingDto> result = electronicListingService.filterElectronics(filters);
        return ResultResponses.ok(Result.success(result));
    }
}
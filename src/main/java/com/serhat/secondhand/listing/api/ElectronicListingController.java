package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.ElectronicListingService;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/v1/electronics")
@RequiredArgsConstructor
@Slf4j
public class ElectronicListingController {

    private final ElectronicListingService electronicListingService;

    @PostMapping("/create-listing")
    @Operation(summary = "Create a new electronic listing")
    public ResponseEntity<Void> createElectronicListings(
            @Valid @RequestBody ElectronicCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        UUID electronicId = electronicListingService.createElectronicListing(request, currentUser);
        URI location = URI.create("/api/v1/electronics/" + electronicId);
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a electronic listing")
    public ResponseEntity<Void> updateElectronicListing(
            @PathVariable UUID id,
            @Valid @RequestBody ElectronicUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        electronicListingService.updateElectronicListings(id, request, currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get electronic listing details")
    public ResponseEntity<ElectronicListingDto> getElectronicDetails(@PathVariable UUID id) {
        ElectronicListingDto electronic = electronicListingService.getElectronicDetails(id);
        return ResponseEntity.ok(electronic);
    }



    @GetMapping("/electronicType/{electronicType}")
    @Operation(summary = "Find electronics by type")
    public ResponseEntity<List<ElectronicListingDto>> findByElectronicType(
            @PathVariable ElectronicType electronicType) {
        List<ElectronicListingDto> electronicDto = electronicListingService.findByElectronicType(electronicType);
        return ResponseEntity.ok(electronicDto);
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter electronics listings with advanced criteria")
    public ResponseEntity<Page<ListingDto>> filterElectronics(@RequestBody ElectronicListingFilterDto filters) {
        log.info("Filtering electronics with criteria: {}", filters);
        Page<ListingDto> result = electronicListingService.filterElectronics(filters);
        return ResponseEntity.ok(result);
    }

}

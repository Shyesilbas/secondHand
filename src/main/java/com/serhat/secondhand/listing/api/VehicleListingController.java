package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.vehicle.VehicleListingService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Vehicle Listings", description = "Vehicle listing CRUD operations and search")
public class VehicleListingController {
    
    private final VehicleListingService vehicleListingService;
    
    @PostMapping("/create-listing")
    @Operation(summary = "Create a new vehicle listing")
    public ResponseEntity<Void> createVehicleListing(
            @Valid @RequestBody VehicleCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        UUID vehicleId = vehicleListingService.createVehicleListing(request, currentUser);
        URI location = URI.create("/api/v1/vehicles/" + vehicleId);
        return ResponseEntity.created(location).build();
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a vehicle listing")
    public ResponseEntity<Void> updateVehicleListing(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        vehicleListingService.updateVehicleListing(id, request, currentUser);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle listing details")
    public ResponseEntity<VehicleListingDto> getVehicleDetails(@PathVariable UUID id) {
        VehicleListingDto vehicle = vehicleListingService.getVehicleDetails(id);
        return ResponseEntity.ok(vehicle);
    }
    

    
    @GetMapping("/brand/{brand}/model/{model}")
    @Operation(summary = "Find vehicles by brand and model")
    public ResponseEntity<List<VehicleListingDto>> findByBrandAndModel(
            @PathVariable CarBrand brand,
            @PathVariable String model) {
        List<VehicleListingDto> vehicles = vehicleListingService.findByBrandAndModel(brand, model);
        return ResponseEntity.ok(vehicles);
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter vehicle listings with advanced criteria")
    public ResponseEntity<Page<ListingDto>> filterVehicles(@RequestBody VehicleListingFilterDto filters) {
        log.info("Filtering vehicles with criteria: {}", filters);
        Page<ListingDto> result = vehicleListingService.filterVehicles(filters);
        return ResponseEntity.ok(result);
    }

} 
package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.VehicleListingService;
import com.serhat.secondhand.listing.domain.dto.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.request.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.CarBrand;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        URI location = URI.create("/api/vehicles/" + vehicleId);
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
    
    @GetMapping("/brands")
    @Operation(summary = "Get all available car brands")
    public ResponseEntity<CarBrand[]> getAllBrands() {
        return ResponseEntity.ok(CarBrand.values());
    }
} 
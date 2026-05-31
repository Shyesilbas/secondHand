package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/real-estate/specs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RealEstateCatalogController {

    private final RealEstateSpecCatalogService realEstateSpecCatalogService;

    @GetMapping("/room-configs")
    public ResponseEntity<List<RealEstateSpecCatalogService.SpecDto>> getRoomConfigs() {
        return ResponseEntity.ok(realEstateSpecCatalogService.getRoomConfigs());
    }

    @GetMapping("/heating-types")
    public ResponseEntity<List<RealEstateSpecCatalogService.SpecDto>> getHeatingTypes() {
        return ResponseEntity.ok(realEstateSpecCatalogService.getHeatingTypes());
    }

    @GetMapping("/zoning-statuses")
    public ResponseEntity<List<RealEstateSpecCatalogService.SpecDto>> getZoningStatuses() {
        return ResponseEntity.ok(realEstateSpecCatalogService.getZoningStatuses());
    }
}

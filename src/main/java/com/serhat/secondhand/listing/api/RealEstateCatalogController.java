package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Serves non-entity real estate spec catalogs (room configs, zoning statuses).
 * <p>
 * Heating types are served from {@code EnumController}
 * ({@code GET /api/enums/heating-types}) as full DB reference data,
 * not from this in-memory catalog.
 */
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

    @GetMapping("/zoning-statuses")
    public ResponseEntity<List<RealEstateSpecCatalogService.SpecDto>> getZoningStatuses() {
        return ResponseEntity.ok(realEstateSpecCatalogService.getZoningStatuses());
    }
}

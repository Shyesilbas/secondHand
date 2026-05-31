package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.common.LocationCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LocationCatalogController {

    private final LocationCatalogService locationCatalogService;

    @GetMapping("/cities")
    public ResponseEntity<List<LocationCatalogService.CityDto>> getCities() {
        return ResponseEntity.ok(locationCatalogService.getCities());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<LocationCatalogService.DistrictDto>> getDistricts(
            @RequestParam String cityKey) {
        return ResponseEntity.ok(locationCatalogService.getDistricts(cityKey));
    }

    @GetMapping("/neighborhoods")
    public ResponseEntity<List<LocationCatalogService.NeighborhoodDto>> getNeighborhoods(
            @RequestParam String districtKey) {
        return ResponseEntity.ok(locationCatalogService.getNeighborhoods(districtKey));
    }
}

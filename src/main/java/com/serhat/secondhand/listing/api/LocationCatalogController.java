package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;

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
    public ResponseEntity<?> getCities() {
        return ResultResponses.ok(Result.success(locationCatalogService.getCities()));
    }

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(
            @RequestParam String cityKey) {
        return ResultResponses.ok(Result.success(locationCatalogService.getDistricts(cityKey)));
    }

    @GetMapping("/neighborhoods")
    public ResponseEntity<?> getNeighborhoods(
            @RequestParam String districtKey) {
        return ResultResponses.ok(Result.success(locationCatalogService.getNeighborhoods(districtKey)));
    }
}

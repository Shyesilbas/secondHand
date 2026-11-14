package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.application.vehicle.VehicleCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleCatalogItemDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Level-by-level vehicle catalog for the listing form and filters. Each level takes its parent id;
 * {@code year} narrows generations and versions to those sold in that model year.
 */
@RestController
@RequestMapping("/api/v1/catalog/vehicle")
@RequiredArgsConstructor
@PublicEndpoint
@Tag(name = "Vehicle Catalog", description = "Vehicle type, brand, model, generation, version and trim lookups")
public class VehicleCatalogController {

    private final VehicleCatalogService vehicleCatalogService;

    @GetMapping("/types")
    @Operation(summary = "Vehicle types")
    public ResponseEntity<List<VehicleCatalogItemDto>> types() {
        return ResultResponses.ok(Result.success(vehicleCatalogService.types()));
    }

    @GetMapping("/brands")
    @Operation(summary = "Brands that have models of the vehicle type")
    public ResponseEntity<List<VehicleCatalogItemDto>> brands(@RequestParam UUID typeId) {
        return ResultResponses.ok(Result.success(vehicleCatalogService.brands(typeId)));
    }

    @GetMapping("/models")
    @Operation(summary = "Models of a brand for the vehicle type")
    public ResponseEntity<List<VehicleCatalogItemDto>> models(@RequestParam UUID brandId, @RequestParam UUID typeId) {
        return ResultResponses.ok(Result.success(vehicleCatalogService.models(brandId, typeId)));
    }

    @GetMapping("/generations")
    @Operation(summary = "Generations of a model, with body type, doors and seats")
    public ResponseEntity<List<VehicleCatalogItemDto>> generations(@RequestParam UUID modelId, @RequestParam(required = false) Integer year) {
        return ResultResponses.ok(Result.success(vehicleCatalogService.generations(modelId, year)));
    }

    @GetMapping("/versions")
    @Operation(summary = "Versions of a generation, with the specs a listing copies")
    public ResponseEntity<List<VehicleCatalogItemDto>> versions(@RequestParam UUID generationId, @RequestParam(required = false) Integer year) {
        return ResultResponses.ok(Result.success(vehicleCatalogService.versions(generationId, year)));
    }

    @GetMapping("/trims")
    @Operation(summary = "Trims of a generation")
    public ResponseEntity<List<VehicleCatalogItemDto>> trims(@RequestParam UUID generationId) {
        return ResultResponses.ok(Result.success(vehicleCatalogService.trims(generationId)));
    }

    @GetMapping("/attributes")
    @Operation(summary = "Attribute definitions of a vehicle type")
    public ResponseEntity<List<AttributeDefinitionDto>> attributes(@RequestParam UUID typeId) {
        return ResultResponses.ok(vehicleCatalogService.attributes(typeId));
    }
}

package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.application.realestate.RealEstateAttributeCatalogService;
import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Real estate catalog lookups: spec lists (room configs, zoning statuses; also in {@code /api/v1/enums/all})
 * and the attribute definitions of a property type for the listing form and detail page.
 */
@RestController
@RequestMapping("/api/v1/catalog/real-estate")
@RequiredArgsConstructor
public class RealEstateCatalogController {

    private final RealEstateSpecCatalogService realEstateSpecCatalogService;
    private final RealEstateAttributeCatalogService realEstateAttributeCatalogService;

    @GetMapping("/specs/room-configs")
    public ResponseEntity<List<RealEstateSpecCatalogService.SpecDto>> getRoomConfigs() {
        return ResultResponses.ok(Result.success(realEstateSpecCatalogService.getRoomConfigs()));
    }

    @GetMapping("/specs/zoning-statuses")
    public ResponseEntity<List<RealEstateSpecCatalogService.SpecDto>> getZoningStatuses() {
        return ResultResponses.ok(Result.success(realEstateSpecCatalogService.getZoningStatuses()));
    }

    @PublicEndpoint
    @GetMapping("/attributes")
    @Operation(summary = "Attribute definitions of a real estate type")
    public ResponseEntity<List<AttributeDefinitionDto>> attributes(@RequestParam UUID typeId) {
        return ResultResponses.ok(realEstateAttributeCatalogService.attributes(typeId));
    }
}

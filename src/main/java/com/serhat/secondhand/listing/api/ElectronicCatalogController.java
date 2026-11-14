package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.application.electronics.ElectronicCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicModelCatalogDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Electronics catalog lookups for the listing form: model facts with variants, and type attributes. */
@RestController
@RequestMapping("/api/v1/catalog/electronics")
@RequiredArgsConstructor
@PublicEndpoint
@Tag(name = "Electronics Catalog", description = "Electronic model specs, colors, variants and attribute lookups")
public class ElectronicCatalogController {

    private final ElectronicCatalogService electronicCatalogService;

    @GetMapping("/models/{modelId}")
    @Operation(summary = "Specs, official colors and variants of an electronic model")
    public ResponseEntity<ElectronicModelCatalogDto> model(@PathVariable UUID modelId) {
        return ResultResponses.ok(electronicCatalogService.model(modelId));
    }

    @GetMapping("/attributes")
    @Operation(summary = "Attribute definitions of an electronic type")
    public ResponseEntity<List<AttributeDefinitionDto>> attributes(@RequestParam UUID typeId) {
        return ResultResponses.ok(electronicCatalogService.attributes(typeId));
    }
}

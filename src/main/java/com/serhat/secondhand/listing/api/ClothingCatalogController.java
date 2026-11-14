package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.application.clothing.ClothingAttributeCatalogService;
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

/** Clothing catalog lookups: the attribute definitions of a clothing type for the listing form and detail page. */
@RestController
@RequestMapping("/api/v1/catalog/clothing")
@RequiredArgsConstructor
public class ClothingCatalogController {

    private final ClothingAttributeCatalogService clothingAttributeCatalogService;

    @PublicEndpoint
    @GetMapping("/attributes")
    @Operation(summary = "Attribute definitions of a clothing type")
    public ResponseEntity<List<AttributeDefinitionDto>> attributes(@RequestParam UUID typeId) {
        return ResultResponses.ok(clothingAttributeCatalogService.attributes(typeId));
    }
}

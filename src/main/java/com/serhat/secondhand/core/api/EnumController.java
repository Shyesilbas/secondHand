package com.serhat.secondhand.core.api;

import com.serhat.secondhand.core.application.EnumCatalogService;
import com.serhat.secondhand.core.security.PublicEndpoint;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/enums")
@RequiredArgsConstructor
@Tag(name = "Enum Values", description = "Endpoints for getting enum values from backend")
@PublicEndpoint
public class EnumController {

    private final EnumCatalogService enumCatalogService;

    @GetMapping("/all")
    @Operation(summary = "Get all enums", description = "Returns all enum values in a single response for efficient loading")
    public ResponseEntity<Map<String, Object>> getAllEnums() {
        // Short browser cache; the client also keeps it in React Query for a day.
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(enumCatalogService.getAllEnums());
    }
}

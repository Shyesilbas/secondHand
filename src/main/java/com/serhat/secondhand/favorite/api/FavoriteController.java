package com.serhat.secondhand.favorite.api;

import com.serhat.secondhand.favorite.application.FavoriteService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteRequest;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Favorites", description = "Favorite listings management")
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    
    @PostMapping
    @Operation(summary = "Add listing to favorites", description = "Add a listing to the current user's favorites")
    @ApiResponse(responseCode = "200", description = "Listing added to favorites successfully")
    @ApiResponse(responseCode = "400", description = "Listing already in favorites or invalid request")
    @ApiResponse(responseCode = "404", description = "Listing not found")
    public ResponseEntity<?> addToFavorites(
            @Valid @RequestBody FavoriteRequest request,
            @AuthenticationPrincipal User currentUser) {

        var result = favoriteService.addToFavorites(currentUser.getId(), request.getListingId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @DeleteMapping("/{listingId}")
    @Operation(summary = "Remove listing from favorites", description = "Remove a listing from the current user's favorites")
    @ApiResponse(responseCode = "204", description = "Listing removed from favorites successfully")
    @ApiResponse(responseCode = "400", description = "Listing not in favorites")
    public ResponseEntity<?> removeFromFavorites(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {

        var result = favoriteService.removeFromFavorites(currentUser.getId(), listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/toggle")
    @Operation(summary = "Toggle favorite status", description = "Add to favorites if not exists, remove if exists")
    @ApiResponse(responseCode = "200", description = "Favorite status toggled successfully")
    public ResponseEntity<?> toggleFavorite(
            @Valid @RequestBody FavoriteRequest request,
            @AuthenticationPrincipal User currentUser) {

        var result = favoriteService.toggleFavorite(currentUser.getId(), request.getListingId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @GetMapping
    @Operation(summary = "Get user's favorites", description = "Get current user's favorite listings with pagination")
    @ApiResponse(responseCode = "200", description = "Favorites retrieved successfully")
    public ResponseEntity<?> getUserFavorites(
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {

        var result = favoriteService.getUserFavorites(currentUser.getId(), pageable);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @GetMapping("/stats/{listingId}")
    @Operation(summary = "Get favorite stats for listing", description = "Get favorite count and user's favorite status for a listing")
    @ApiResponse(responseCode = "200", description = "Stats retrieved successfully")
    public ResponseEntity<?> getFavoriteStats(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;
        var result = favoriteService.getFavoriteStats(listingId, userId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @PostMapping("/stats")
    @Operation(summary = "Get favorite stats for multiple listings", description = "Get favorite statistics for multiple listings")
    @ApiResponse(responseCode = "200", description = "Stats retrieved successfully")
    public ResponseEntity<?> getFavoriteStatsForListings(
            @RequestBody List<UUID> listingIds,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;
        var result = favoriteService.getFavoriteStatsForListings(listingIds, userId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @GetMapping("/check/{listingId}")
    @Operation(summary = "Check if listing is favorited", description = "Check if current user has favorited a specific listing")
    @ApiResponse(responseCode = "200", description = "Check completed successfully")
    public ResponseEntity<?> isFavorited(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {

        var result = favoriteService.isFavorited(currentUser.getId(), listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @GetMapping("/count/{listingId}")
    @Operation(summary = "Get favorite count", description = "Get total number of users who favorited a listing")
    @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    public ResponseEntity<?> getFavoriteCount(@PathVariable UUID listingId) {
        var result = favoriteService.getFavoriteCount(listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @GetMapping("/ids")
    @Operation(summary = "Get user's favorite listing IDs", description = "Get list of listing IDs that user has favorited")
    @ApiResponse(responseCode = "200", description = "IDs retrieved successfully")
    public ResponseEntity<?> getUserFavoriteIds(@AuthenticationPrincipal User currentUser) {
        var result = favoriteService.getUserFavoriteIds(currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
    
    @GetMapping("/top")
    @Operation(summary = "Get top favorited listings", description = "Get most favorited listings")
    @ApiResponse(responseCode = "200", description = "Top favorites retrieved successfully")
    public ResponseEntity<?> getTopFavoritedListings(
            @PageableDefault(size = 10) Pageable pageable) {
        
        var result = favoriteService.getTopFavoritedListings(pageable);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/top-listings")
    @Operation(summary = "Get top favorited listings with details", description = "Get most favorited listings with full listing details")
    @ApiResponse(responseCode = "200", description = "Top favorites with details retrieved successfully")
    public ResponseEntity<?> getTopFavoritedListingsWithDetails(
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;
        var result = favoriteService.getTopFavoritedListingsWithDetails(size, userId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
}
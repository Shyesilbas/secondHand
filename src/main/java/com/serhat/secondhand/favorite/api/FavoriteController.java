package com.serhat.secondhand.favorite.api;

import com.serhat.secondhand.favorite.application.FavoriteService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteDto;
import com.serhat.secondhand.favorite.domain.dto.FavoriteRequest;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final UserService userService;
    
    @PostMapping
    @Operation(summary = "Add listing to favorites", description = "Add a listing to the current user's favorites")
    @ApiResponse(responseCode = "200", description = "Listing added to favorites successfully")
    @ApiResponse(responseCode = "400", description = "Listing already in favorites or invalid request")
    @ApiResponse(responseCode = "404", description = "Listing not found")
    public ResponseEntity<FavoriteDto> addToFavorites(
            @Valid @RequestBody FavoriteRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail);
        FavoriteDto favorite = favoriteService.addToFavorites(user, request.getListingId());
        
        return ResponseEntity.ok(favorite);
    }
    
    @DeleteMapping("/{listingId}")
    @Operation(summary = "Remove listing from favorites", description = "Remove a listing from the current user's favorites")
    @ApiResponse(responseCode = "204", description = "Listing removed from favorites successfully")
    @ApiResponse(responseCode = "400", description = "Listing not in favorites")
    public ResponseEntity<Void> removeFromFavorites(
            @PathVariable UUID listingId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail);
        favoriteService.removeFromFavorites(user, listingId);
        
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/toggle")
    @Operation(summary = "Toggle favorite status", description = "Add to favorites if not exists, remove if exists")
    @ApiResponse(responseCode = "200", description = "Favorite status toggled successfully")
    public ResponseEntity<FavoriteStatsDto> toggleFavorite(
            @Valid @RequestBody FavoriteRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail);
        FavoriteStatsDto stats = favoriteService.toggleFavorite(user, request.getListingId());
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping
    @Operation(summary = "Get user's favorites", description = "Get current user's favorite listings with pagination")
    @ApiResponse(responseCode = "200", description = "Favorites retrieved successfully")
    public ResponseEntity<Page<FavoriteDto>> getUserFavorites(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail);
        Page<FavoriteDto> favorites = favoriteService.getUserFavorites(user, pageable);
        
        return ResponseEntity.ok(favorites);
    }
    
    @GetMapping("/stats/{listingId}")
    @Operation(summary = "Get favorite stats for listing", description = "Get favorite count and user's favorite status for a listing")
    @ApiResponse(responseCode = "200", description = "Stats retrieved successfully")
    public ResponseEntity<FavoriteStatsDto> getFavoriteStats(
            @PathVariable UUID listingId,
            Authentication authentication) {
        
        String userEmail = authentication != null ? authentication.getName() : null;
        FavoriteStatsDto stats = favoriteService.getFavoriteStats(listingId, userEmail);
        
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/stats")
    @Operation(summary = "Get favorite stats for multiple listings", description = "Get favorite statistics for multiple listings")
    @ApiResponse(responseCode = "200", description = "Stats retrieved successfully")
    public ResponseEntity<Map<UUID, FavoriteStatsDto>> getFavoriteStatsForListings(
            @RequestBody List<UUID> listingIds,
            Authentication authentication) {
        
        String userEmail = authentication != null ? authentication.getName() : null;
        Map<UUID, FavoriteStatsDto> stats = favoriteService.getFavoriteStatsForListings(listingIds, userEmail);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/check/{listingId}")
    @Operation(summary = "Check if listing is favorited", description = "Check if current user has favorited a specific listing")
    @ApiResponse(responseCode = "200", description = "Check completed successfully")
    public ResponseEntity<Boolean> isFavorited(
            @PathVariable UUID listingId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail);
        boolean isFavorited = favoriteService.isFavorited(user, listingId);
        
        return ResponseEntity.ok(isFavorited);
    }
    
    @GetMapping("/count/{listingId}")
    @Operation(summary = "Get favorite count", description = "Get total number of users who favorited a listing")
    @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    public ResponseEntity<Long> getFavoriteCount(@PathVariable UUID listingId) {
        long count = favoriteService.getFavoriteCount(listingId);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/ids")
    @Operation(summary = "Get user's favorite listing IDs", description = "Get list of listing IDs that user has favorited")
    @ApiResponse(responseCode = "200", description = "IDs retrieved successfully")
    public ResponseEntity<List<UUID>> getUserFavoriteIds(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail);
        List<UUID> favoriteIds = favoriteService.getUserFavoriteIds(user);
        
        return ResponseEntity.ok(favoriteIds);
    }
    
    @GetMapping("/top")
    @Operation(summary = "Get top favorited listings", description = "Get most favorited listings")
    @ApiResponse(responseCode = "200", description = "Top favorites retrieved successfully")
    public ResponseEntity<Page<Object[]>> getTopFavoritedListings(
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<Object[]> topFavorites = favoriteService.getTopFavoritedListings(pageable);
        return ResponseEntity.ok(topFavorites);
    }
}
package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.domain.dto.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/listings")
@Tag(name = "Listing", description = "General listing operations")
public class ListingController {
    
    private final IListingService listingService;
    private final ListingMapper listingMapper;
    
    @GetMapping("/{id}")
    @Operation(summary = "Get listing by ID - Returns appropriate DTO based on listing type")
    public ResponseEntity<ListingDto> getListingById(@PathVariable UUID id) {
        return listingService.findById(id)
                .map(listingMapper::toDynamicDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get listings by status - Returns appropriate DTOs based on listing types")
    public ResponseEntity<List<ListingDto>> getListingsByStatus(@PathVariable ListingStatus status) {
        List<Listing> listings = listingService.findByStatus(status);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }
    
    @PutMapping("/{id}/publish")
    @Operation(summary = "Publish a listing")
    public ResponseEntity<Void> publishListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.validateOwnership(id, currentUser);
        listingService.publish(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/close")
    @Operation(summary = "Close a listing")
    public ResponseEntity<Void> closeListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.validateOwnership(id, currentUser);
        listingService.close(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/mark-sold")
    @Operation(summary = "Mark listing as sold")
    public ResponseEntity<Void> markListingAsSold(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.validateOwnership(id, currentUser);
        listingService.markAsSold(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a listing")
    public ResponseEntity<Void> deactivateListing(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        listingService.validateOwnership(id, currentUser);
        listingService.deactivate(id);
        return ResponseEntity.ok().build();
    }
}

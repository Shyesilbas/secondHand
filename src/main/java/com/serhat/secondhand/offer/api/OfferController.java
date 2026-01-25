package com.serhat.secondhand.offer.api;

import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.dto.OfferDto;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Offers", description = "Offer management operations")
public class OfferController {

    private final OfferService offerService;

    @PostMapping
    @Operation(summary = "Create offer", description = "Create a new offer for a listing")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Offer created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Listing not found")
    })
    public ResponseEntity<?> create(@Valid @RequestBody CreateOfferRequest request,
                                    @AuthenticationPrincipal User currentUser) {
        log.info("API request to create offer by user: {} for listing: {}", currentUser.getEmail(), request.getListingId());
        var result = offerService.create(currentUser.getId(), request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/made")
    @Operation(summary = "List offers I made", description = "List offers created by the authenticated user")
    public ResponseEntity<List<OfferDto>> listMade(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(offerService.listMade(currentUser.getId()));
    }

    @GetMapping("/received")
    @Operation(summary = "List offers I received", description = "List offers received by the authenticated seller")
    public ResponseEntity<List<OfferDto>> listReceived(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(offerService.listReceived(currentUser.getId()));
    }

    @GetMapping("/{offerId}")
    @Operation(summary = "Get offer", description = "Get a single offer by id (buyer or seller only)")
    public ResponseEntity<?> getById(@PathVariable UUID offerId,
                                           @AuthenticationPrincipal User currentUser) {
        var result = offerService.getByIdForUser(currentUser.getId(), offerId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/{offerId}/accept")
    @Operation(summary = "Accept offer", description = "Seller accepts an offer")
    public ResponseEntity<?> accept(@PathVariable UUID offerId,
                                          @AuthenticationPrincipal User currentUser) {
        var result = offerService.accept(currentUser.getId(), offerId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/{offerId}/reject")
    @Operation(summary = "Reject offer", description = "Seller rejects an offer")
    public ResponseEntity<?> reject(@PathVariable UUID offerId,
                                          @AuthenticationPrincipal User currentUser) {
        var result = offerService.reject(currentUser.getId(), offerId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/{offerId}/counter")
    @Operation(summary = "Counter offer", description = "Seller counters an offer (creates a new offer record)")
    public ResponseEntity<?> counter(@PathVariable UUID offerId,
                                           @Valid @RequestBody CounterOfferRequest request,
                                           @AuthenticationPrincipal User currentUser) {
        var result = offerService.counter(currentUser.getId(), offerId, request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }
}


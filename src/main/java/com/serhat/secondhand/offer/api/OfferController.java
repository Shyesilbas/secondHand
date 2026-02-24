package com.serhat.secondhand.offer.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.service.IOfferService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Offers", description = "Offer management operations")
public class OfferController {

    private final IOfferService offerService;

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
        return ResultResponses.ok(offerService.create(currentUser.getId(), request));
    }

    @GetMapping("/{offerId}")
    @Operation(summary = "Get offer", description = "Get a single offer by id (buyer or seller only)")
    public ResponseEntity<?> getById(@PathVariable UUID offerId,
                                           @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(offerService.getByIdForUser(currentUser.getId(), offerId));
    }

    @PostMapping("/{offerId}/accept")
    @Operation(summary = "Accept offer", description = "Seller accepts an offer")
    public ResponseEntity<?> accept(@PathVariable UUID offerId,
                                          @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(offerService.accept(currentUser.getId(), offerId));
    }

    @PostMapping("/{offerId}/reject")
    @Operation(summary = "Reject offer", description = "Seller rejects an offer")
    public ResponseEntity<?> reject(@PathVariable UUID offerId,
                                          @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(offerService.reject(currentUser.getId(), offerId));
    }

    @PostMapping("/{offerId}/counter")
    @Operation(summary = "Counter offer", description = "Seller counters an offer (creates a new offer record)")
    public ResponseEntity<?> counter(@PathVariable UUID offerId,
                                           @Valid @RequestBody CounterOfferRequest request,
                                           @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(offerService.counter(currentUser.getId(), offerId, request));
    }
}


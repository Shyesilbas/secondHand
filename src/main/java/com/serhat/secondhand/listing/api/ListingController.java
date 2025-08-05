package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.application.ListingPaymentService;
import com.serhat.secondhand.listing.domain.dto.ListingDto;
import com.serhat.secondhand.listing.domain.dto.ListingPaymentRequest;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/listings")
@Tag(name = "Listing", description = "General listing operations")
public class ListingController {
    
    private final IListingService listingService;
    private final ListingMapper listingMapper;
    private final ListingPaymentService listingPaymentService;
    
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
        List<ListingDto> dtos = listingService.findByStatusAsDto(status);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/my-listings")
    @Operation(summary = "Get current user's all listings")
    public ResponseEntity<List<ListingDto>> getMyListings(@AuthenticationPrincipal User currentUser) {
        List<ListingDto> myListings = listingService.getMyListings(currentUser);
        return ResponseEntity.ok(myListings);
    }

    @GetMapping("/my-listings/status/{status}")
    @Operation(summary = "Get current user's listings by status")
    public ResponseEntity<List<ListingDto>> getMyListingsByStatus(
            @PathVariable ListingStatus status,
            @AuthenticationPrincipal User currentUser) {
        List<ListingDto> myListings = listingService.getMyListingsByStatus(currentUser, status);
        return ResponseEntity.ok(myListings);
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

    // ==================== PAYMENT ENDPOINTS ====================

    @PostMapping("/{id}/pay-creation-fee")
    @Operation(summary = "Pay listing creation fee to activate the listing")
    public ResponseEntity<PaymentDto> payListingCreationFee(
            @PathVariable UUID id,
            @RequestBody ListingPaymentRequest paymentRequest,
            @AuthenticationPrincipal User currentUser) {
        
        // Set listing ID from path parameter
        ListingPaymentRequest request = new ListingPaymentRequest(
                id,
                paymentRequest.paymentType(),
                paymentRequest.creditCard()
        );
        
        PaymentDto paymentResult = listingPaymentService.processListingCreationPayment(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentResult);
    }

    @PostMapping("/{id}/purchase")
    @Operation(summary = "Purchase an item from a listing")
    public ResponseEntity<PaymentDto> purchaseItem(
            @PathVariable UUID id,
            @RequestBody ListingPaymentRequest paymentRequest,
            @AuthenticationPrincipal User currentUser) {
        
        PaymentDto paymentResult = listingPaymentService.processItemPurchasePayment(
                currentUser, id, paymentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentResult);
    }

    @GetMapping("/fees")
    @Operation(summary = "Get listing fees information")
    public ResponseEntity<Map<String, Object>> getListingFees() {
        Map<String, Object> fees = new HashMap<>();
        fees.put("creationFee", listingPaymentService.getListingCreationFee());
        fees.put("promotionFee", listingPaymentService.getListingPromotionFee());
        return ResponseEntity.ok(fees);
    }

    @GetMapping("/{id}/fee-status")
    @Operation(summary = "Check if listing creation fee has been paid")
    public ResponseEntity<Map<String, Object>> getListingFeeStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        
        listingService.validateOwnership(id, currentUser);
        
        Listing listing = listingService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        
        Map<String, Object> status = new HashMap<>();
        status.put("listingId", id);
        status.put("isFeePaid", listing.isListingFeePaid());
        status.put("status", listing.getStatus());
        status.put("canPayFee", listing.getStatus() == ListingStatus.DRAFT && !listing.isListingFeePaid());
        status.put("feeAmount", listingPaymentService.getListingCreationFee());
        
        return ResponseEntity.ok(status);
    }
}

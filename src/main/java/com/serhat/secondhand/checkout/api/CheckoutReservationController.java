package com.serhat.secondhand.checkout.api;

import com.serhat.secondhand.checkout.application.CheckoutStockReservationService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout Reservation", description = "Endpoints for holding and releasing stock during checkout flow")
public class CheckoutReservationController {

    private final CheckoutStockReservationService stockReservationService;

    @PostMapping("/initiate")
    @Operation(summary = "Initiate checkout stock reservation", description = "Reserves user's cart items in Redis with 15-min TTL upon entering checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> initiateReservation(@AuthenticationPrincipal User currentUser) {
        log.info("User {} initiating checkout stock reservation", currentUser.getId());
        Result<Map<UUID, Integer>> reserveResult = stockReservationService.reserveUserCartStock(currentUser.getId());
        if (reserveResult.isError()) {
            return ResultResponses.ok(reserveResult);
        }
        long remainingTtl = stockReservationService.getRemainingTtlForUser(currentUser.getId());
        return ResultResponses.ok(Result.success(Map.of(
                "reserved", reserveResult.getData(),
                "remainingTtlSeconds", remainingTtl
        )));
    }

    @DeleteMapping("/reservation/{listingId}")
    @Operation(summary = "Cancel stock reservation", description = "Explicitly releases held stock in Redis if user navigates away or removes item")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelReservation(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {
        log.info("User {} cancelling stock reservation for listing {}", currentUser.getId(), listingId);
        stockReservationService.releaseReservedStock(currentUser.getId(), Map.of(listingId, 1));
        return ResultResponses.ok(Result.success("Stock reservation cancelled successfully."));
    }
}

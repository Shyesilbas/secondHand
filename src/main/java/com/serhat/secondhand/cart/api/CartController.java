package com.serhat.secondhand.cart.api;

import com.serhat.secondhand.cart.application.CartService;
import com.serhat.secondhand.cart.dto.AddToCartRequest;
import com.serhat.secondhand.cart.dto.UpdateCartItemRequest;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cart Management", description = "Shopping cart operations")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get cart items", description = "Get all items in the user's cart with pagination")

    public ResponseEntity<?> getCartItems(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.debug("Get cart items request - user: {}", currentUser.getEmail());
        return ResultResponses.ok(cartService.getCartItems(currentUser.getId(), pageable));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Add a listing to the user's cart")

    public ResponseEntity<?> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Add to cart request - user: {}, listingId: {}",
                currentUser.getEmail(), request.getListingId());
        return ResultResponses.ok(cartService.addToCart(currentUser.getId(), request));
    }

    @PutMapping("/items/{listingId}")
    @Operation(summary = "Update cart item", description = "Update quantity or notes of a cart item")

    public ResponseEntity<?> updateCartItem(
            @PathVariable UUID listingId,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Update cart item request - user: {}, listingId: {}",
                currentUser.getEmail(), listingId);
        return ResultResponses.ok(cartService.updateCartItem(currentUser.getId(), listingId, request));
    }

    @DeleteMapping("/items/{listingId}")
    @Operation(summary = "Remove item from cart", description = "Remove a specific item from the user's cart")

    public ResponseEntity<?> removeFromCart(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Remove from cart request - user: {}, listingId: {}",
                currentUser.getEmail(), listingId);
        return ResultResponses.okWithBody(
                cartService.removeFromCart(currentUser.getId(), listingId),
                Map.of("message", "Item removed from cart successfully"));
    }

    @DeleteMapping("/items")
    @Operation(summary = "Clear cart", description = "Remove all items from the user's cart")

    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User currentUser) {

        log.debug("Clear cart request - user: {}", currentUser.getEmail());
        return ResultResponses.okWithBody(
                cartService.clearCart(currentUser.getId()),
                Map.of("message", "Cart cleared successfully"));
    }

    @GetMapping("/count")
    @Operation(summary = "Get cart item count", description = "Get the total number of items in the user's cart")

    public ResponseEntity<?> getCartItemCount(@AuthenticationPrincipal User currentUser) {

        log.debug("Get cart count request - user: {}", currentUser.getEmail());
        var result = cartService.getCartItemCount(currentUser.getId());
        return ResultResponses.okWithBody(result, Map.of("count", result.getData()));
    }

    @GetMapping("/check/{listingId}")
    @Operation(summary = "Check if item is in cart", description = "Check if a specific listing is in the user's cart")

    public ResponseEntity<?> isInCart(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Check in cart request - user: {}, listingId: {}",
                currentUser.getEmail(), listingId);
        var result = cartService.isInCart(currentUser.getId(), listingId);
        return ResultResponses.okWithBody(result, Map.of("inCart", result.getData()));
    }

    @GetMapping("/reservations/count/{listingId}")
    @Operation(summary = "Get active reservation count", description = "Get the total number of active reservations for a listing")

    public ResponseEntity<?> getActiveReservationCount(@PathVariable UUID listingId) {
        log.debug("Get active reservation count request - listingId: {}", listingId);
        var result = cartService.getActiveReservationCount(listingId);
        return ResultResponses.okWithBody(result, Map.of("count", result.getData()));
    }
}
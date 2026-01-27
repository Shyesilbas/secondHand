package com.serhat.secondhand.cart.api;

import com.serhat.secondhand.cart.dto.AddToCartRequest;
import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.dto.UpdateCartItemRequest;
import com.serhat.secondhand.cart.service.CartService;
import com.serhat.secondhand.core.result.Result;
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
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cart Management", description = "Shopping cart operations")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get cart items", description = "Retrieve all items in the user's cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart items retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> getCartItems(@AuthenticationPrincipal User currentUser) {
        log.info("API request to get cart items for user: {}", currentUser.getEmail());
        Result<List<CartDto>> result = cartService.getCartItems(currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Add a listing to the user's cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item added to cart successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Listing not found")
    })
    public ResponseEntity<?> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to add item to cart for user: {} - listingId: {}", 
                currentUser.getEmail(), request.getListingId());
        Result<CartDto> result = cartService.addToCart(currentUser.getId(), request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/items/{listingId}")
    @Operation(summary = "Update cart item", description = "Update quantity or notes of a cart item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart item updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Item not found in cart")
    })
    public ResponseEntity<?> updateCartItem(
            @PathVariable UUID listingId,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to update cart item for user: {} - listingId: {}", 
                currentUser.getEmail(), listingId);
        Result<CartDto> result = cartService.updateCartItem(currentUser.getId(), listingId, request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @DeleteMapping("/items/{listingId}")
    @Operation(summary = "Remove item from cart", description = "Remove a specific item from the user's cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item removed from cart successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Item not found in cart")
    })
    public ResponseEntity<?> removeFromCart(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to remove item from cart for user: {} - listingId: {}", 
                currentUser.getEmail(), listingId);
        Result<Void> result = cartService.removeFromCart(currentUser.getId(), listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", "Item removed from cart successfully"));
    }

    @DeleteMapping("/items")
    @Operation(summary = "Clear cart", description = "Remove all items from the user's cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart cleared successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User currentUser) {
        log.info("API request to clear cart for user: {}", currentUser.getEmail());
        Result<Void> result = cartService.clearCart(currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }

    @GetMapping("/count")
    @Operation(summary = "Get cart item count", description = "Get the total number of items in the user's cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart count retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> getCartItemCount(@AuthenticationPrincipal User currentUser) {
        log.info("API request to get cart item count for user: {}", currentUser.getEmail());
        Result<Long> result = cartService.getCartItemCount(currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(Map.of("count", result.getData()));
    }

    @GetMapping("/check/{listingId}")
    @Operation(summary = "Check if item is in cart", description = "Check if a specific listing is in the user's cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Check completed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> isInCart(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to check if item is in cart for user: {} - listingId: {}", 
                currentUser.getEmail(), listingId);
        Result<Boolean> result = cartService.isInCart(currentUser.getId(), listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(Map.of("inCart", result.getData()));
    }
}

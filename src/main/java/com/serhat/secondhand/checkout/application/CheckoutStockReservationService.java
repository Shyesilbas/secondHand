package com.serhat.secondhand.checkout.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CheckoutStockReservationService {

    private final ListingRepository listingRepository;
    private final InventoryRedisReservationService redisReservationService;
    private final com.serhat.secondhand.cart.repository.CartRepository cartRepository;

    public Result<Map<UUID, Integer>> reserveUserCartStock(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserIdWithListing(userId);
        if (cartItems.isEmpty()) {
            return Result.success(Map.of());
        }
        return reserveStock(userId, cartItems);
    }

    public long getRemainingTtlForUser(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserIdWithListing(userId);
        long minTtl = 900L;
        boolean found = false;
        for (Cart item : cartItems) {
            if (item.getListing() != null) {
                Long ttl = redisReservationService.getReservationRemainingTtl(userId, item.getListing().getId());
                if (ttl != null && ttl > 0) {
                    found = true;
                    if (ttl < minTtl) {
                        minTtl = ttl;
                    }
                }
            }
        }
        return found ? minTtl : 900L;
    }

    public Result<Map<UUID, Integer>> reserveStock(Long userId, List<Cart> cartItems) {
        Map<UUID, Integer> reserved = new HashMap<>();
        for (Cart item : cartItems) {
            UUID listingId = item.getListing() != null ? item.getListing().getId() : null;
            if (listingId == null) {
                releaseReservedStock(userId, reserved);
                return Result.error(ListingErrorCodes.LISTING_NOT_FOUND.toString(), "Listing Not Found.");
            }

            int requestedQty = item.getQuantity() != null ? item.getQuantity() : 1;
            try {
                // High-performance atomic stock reservation via Redis Lua Script with 15-min TTL
                redisReservationService.reserveStockWithTtl(userId, listingId, requestedQty, 900L);
                reserved.merge(listingId, requestedQty, Integer::sum);
            } catch (BusinessException e) {
                log.warn("Stock reservation failed for listingId {} by user {}: {}", listingId, userId, e.getMessage());
                releaseReservedStock(userId, reserved);
                return Result.error(e.getMessage(), e.getErrorCode());
            } catch (Exception e) {
                log.error("Unexpected error during stock reservation for listingId {} by user {}", listingId, userId, e);
                releaseReservedStock(userId, reserved);
                return Result.error("Stock reservation failed. Please try again.", "STOCK_RESERVATION_ERROR");
            }
        }
        return Result.success(reserved);
    }

    public void releaseReservedStock(Long userId, Map<UUID, Integer> reserved) {
        if (reserved == null || reserved.isEmpty()) {
            return;
        }
        reserved.forEach((listingId, quantity) -> {
            try {
                if (userId != null) {
                    redisReservationService.cancelUserReservation(userId, listingId);
                } else {
                    redisReservationService.releaseStock(listingId, quantity);
                }
            } catch (Exception ex) {
                log.error("Failed to release stock in Redis for listingId {} user {}", listingId, userId, ex);
            }
        });
    }

    public void consumeReservationsOnSuccess(Long userId, Map<UUID, Integer> reserved) {
        if (reserved == null || reserved.isEmpty()) {
            return;
        }
        reserved.keySet().forEach(listingId -> {
            try {
                redisReservationService.consumeReservationOnPurchase(userId, listingId);
            } catch (Exception ex) {
                log.warn("Could not delete reservation key for user {} on listing {}", userId, listingId, ex);
            }
        });
    }
}

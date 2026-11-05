package com.serhat.secondhand.checkout.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
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

            if (item.getListing().getStatus() != ListingStatus.ACTIVE) {
                releaseReservedStock(userId, reserved);
                return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
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

    /**
     * Converts the buyer's reservations into pending-purchase markers once the checkout transaction commits.
     * Before the commit the reservations keep the units held; if the transaction rolls back they stay
     * reservations and are cancelled by the caller or expire with their TTL.
     */
    public void consumeReservationsOnSuccess(Long userId, Order order) {
        if (order == null || order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return;
        }
        List<PurchasedLine> lines = new ArrayList<>();
        for (OrderItem item : order.getOrderItems()) {
            if (item.getListing() == null || item.getId() == null) {
                log.warn("Order {} item without listing or id; its reservation is left to expire", order.getOrderNumber());
                continue;
            }
            int quantity = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
            lines.add(new PurchasedLine(item.getListing().getId(), item.getId(), quantity));
        }

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    consumeLines(userId, lines);
                }
            });
        } else {
            consumeLines(userId, lines);
        }
    }

    private void consumeLines(Long userId, List<PurchasedLine> lines) {
        lines.forEach(line -> {
            try {
                redisReservationService.consumeReservationOnPurchase(userId, line.listingId(), line.orderItemId(), line.quantity());
            } catch (Exception ex) {
                // Reservation key stays and expires with its TTL; until then the units remain held (no oversell).
                log.warn("Could not convert reservation of user {} on listing {} to a pending purchase",
                        userId, line.listingId(), ex);
            }
        });
    }

    private record PurchasedLine(UUID listingId, Long orderItemId, int quantity) {
    }
}

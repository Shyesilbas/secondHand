package com.serhat.secondhand.offer.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.util.OfferErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Holds an accepted offer's quantity for its buyer until the payment deadline, in the buyer's regular
 * checkout reservation key. Other buyers' checkouts see the reduced Redis stock, the reconciliation job
 * counts the hold like any reservation, and the buyer's own offer checkout reuses it instead of taking more.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OfferStockHoldService {

    private final InventoryRedisReservationService inventoryReservation;

    /** Reserves the offer quantity; released automatically if the surrounding transaction rolls back. */
    public Result<Void> hold(Offer offer, LocalDateTime paymentDeadline) {
        Long buyerId = offer.getBuyer().getId();
        UUID listingId = offer.getListing().getId();
        long ttlSeconds = Math.max(1, Duration.between(LocalDateTime.now(), paymentDeadline).toSeconds());
        try {
            inventoryReservation.reserveStockWithTtl(buyerId, listingId, offer.getQuantity(), ttlSeconds);
        } catch (BusinessException e) {
            log.warn("Offer {} accept: stock hold refused for listing {}: {}", offer.getId(), listingId, e.getMessage());
            return Result.error(e.getMessage(), e.getErrorCode());
        } catch (org.springframework.dao.DataAccessException | org.springframework.data.redis.serializer.SerializationException e) {
            log.error("Offer {} accept: stock hold failed for listing {}", offer.getId(), listingId, e);
            return Result.error(OfferErrorCodes.OFFER_STOCK_HOLD_FAILED);
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    if (status == STATUS_ROLLED_BACK) {
                        releaseNow(buyerId, listingId);
                    }
                }
            });
        }
        return Result.success();
    }

    /** Gives the held units back now (used when the accept itself fails after the hold). */
    public void releaseNow(Offer offer) {
        releaseNow(offer.getBuyer().getId(), offer.getListing().getId());
    }

    /** Gives the held units back once the expiry commits; immediately when no transaction is active. */
    public void releaseAfterCommit(Offer offer) {
        Long buyerId = offer.getBuyer().getId();
        UUID listingId = offer.getListing().getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    releaseNow(buyerId, listingId);
                }
            });
        } else {
            releaseNow(buyerId, listingId);
        }
    }

    private void releaseNow(Long buyerId, UUID listingId) {
        try {
            inventoryReservation.cancelUserReservation(buyerId, listingId);
        } catch (org.springframework.dao.DataAccessException | org.springframework.data.redis.serializer.SerializationException e) {
            // The reservation key keeps its TTL (the payment deadline), so the units come back at the latest then.
            log.error("Failed to release offer stock hold of buyer {} on listing {}", buyerId, listingId, e);
        }
    }
}

package com.serhat.secondhand.inventory.application;

import com.serhat.secondhand.inventory.domain.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockReservationReconciliationScheduler {

    private final StringRedisTemplate redisTemplate;
    private final InventoryRepository inventoryRepository;

    /**
     * Periodic background sweeper running every 5 minutes.
     * Reconciles Redis stock with Postgres DB by verifying if cached stock is out of sync with physical stock.
     */
    @Scheduled(fixedDelayString = "${app.inventory.reconciliation.fixed-delay-ms:300000}", initialDelay = 60000)
    public void reconcileOrphanedStockReservations() {
        try {
            Set<String> stockKeys = redisTemplate.keys("v4:inventory:stock:*");
            if (stockKeys == null || stockKeys.isEmpty()) {
                return;
            }

            for (String stockKey : stockKeys) {
                String listingIdStr = stockKey.replace("v4:inventory:stock:", "");
                try {
                    UUID listingId = UUID.fromString(listingIdStr);

                    // Find all active reservation keys for this listing
                    Set<String> activeReservations = redisTemplate.keys("v4:inventory:reservation:*:" + listingIdStr);
                    int totalReservedInRedis = 0;
                    if (activeReservations != null) {
                        for (String resKey : activeReservations) {
                            String val = redisTemplate.opsForValue().get(resKey);
                            if (val != null) {
                                totalReservedInRedis += Integer.parseInt(val);
                            }
                        }
                    }

                    // If NO active reservations exist for this listing in Redis,
                    // Redis stock must strictly match PostgreSQL DB availableQuantity!
                    if (totalReservedInRedis == 0) {
                        inventoryRepository.findByListingId(listingId).ifPresent(inventory -> {
                            int dbStock = inventory.getAvailableQuantity();
                            String currentRedisVal = redisTemplate.opsForValue().get(stockKey);
                            if (currentRedisVal != null && Integer.parseInt(currentRedisVal) != dbStock) {
                                log.warn("⚡ [STOCK RECONCILIATION] Listing {} stock drift detected! Redis: {}, DB: {}. Auto-healing Redis stock.",
                                        listingId, currentRedisVal, dbStock);
                                redisTemplate.opsForValue().set(stockKey, String.valueOf(dbStock));
                            }
                        });
                    }
                } catch (IllegalArgumentException ignored) {
                    // Not a valid UUID listing key
                }
            }
        } catch (Exception ex) {
            log.error("Error during stock reservation reconciliation", ex);
        }
    }
}

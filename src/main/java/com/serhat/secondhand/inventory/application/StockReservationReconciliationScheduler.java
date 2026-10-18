package com.serhat.secondhand.inventory.application;

import com.serhat.secondhand.inventory.domain.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
            // SCAN instead of KEYS (KEYS blocks Redis); reservations are summed per listing in one pass
            Map<String, Integer> reservedByListing = new HashMap<>();
            for (String resKey : scan("v4:inventory:reservation:*")) {
                String val = redisTemplate.opsForValue().get(resKey);
                if (val != null) {
                    reservedByListing.merge(resKey.substring(resKey.lastIndexOf(':') + 1), Integer.parseInt(val), Integer::sum);
                }
            }

            for (String stockKey : scan("v4:inventory:stock:*")) {
                String listingIdStr = stockKey.replace("v4:inventory:stock:", "");
                try {
                    UUID listingId = UUID.fromString(listingIdStr);

                    // With no active reservations, Redis stock must match the DB availableQuantity
                    if (reservedByListing.getOrDefault(listingIdStr, 0) == 0) {
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

    private List<String> scan(String pattern) {
        List<String> keys = new ArrayList<>();
        try (Cursor<String> cursor = redisTemplate.scan(ScanOptions.scanOptions().match(pattern).count(500).build())) {
            cursor.forEachRemaining(keys::add);
        }
        return keys;
    }
}

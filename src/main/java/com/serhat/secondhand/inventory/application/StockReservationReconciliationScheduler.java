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
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static com.serhat.secondhand.inventory.application.InventoryRedisReservationService.PENDING_PURCHASE_KEY_PREFIX;
import static com.serhat.secondhand.inventory.application.InventoryRedisReservationService.RESERVATION_KEY_PREFIX;
import static com.serhat.secondhand.inventory.application.InventoryRedisReservationService.STOCK_KEY_PREFIX;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockReservationReconciliationScheduler {

    private final StringRedisTemplate redisTemplate;
    private final InventoryRepository inventoryRepository;
    private final InventoryRedisReservationService redisReservationService;

    /**
     * Periodic sweeper (every 5 minutes) that heals drift between Redis stock and PostgreSQL inventory,
     * mainly the units of reservations whose TTL expired without a purchase or a cancellation.
     * <p>
     * Expected Redis stock = PostgreSQL available quantity − active reservations − pending purchases
     * (paid, not yet deducted in PostgreSQL by InventoryKafkaConsumer).
     * <p>
     * Read order matters: the stock value is observed first, then reservations, then pending purchases,
     * then PostgreSQL. A hold that moves between these reads is counted twice at worst (correction too low,
     * fixed on the next run), never missed. The write is a Lua compare-and-set against the observed value,
     * so a reservation, cancellation or release made during the run is never overwritten.
     */
    @Scheduled(fixedDelayString = "${app.inventory.reconciliation.fixed-delay-ms:300000}", initialDelay = 60000)
    public void reconcileOrphanedStockReservations() {
        try {
            // SCAN instead of KEYS (KEYS blocks Redis)
            Map<String, String> observedStock = new LinkedHashMap<>();
            for (String stockKey : scan(STOCK_KEY_PREFIX + "*")) {
                String value = redisTemplate.opsForValue().get(stockKey);
                if (value != null) {
                    observedStock.put(stockKey.substring(STOCK_KEY_PREFIX.length()), value);
                }
            }

            Map<String, Integer> heldByListing = new HashMap<>();
            Set<String> unreadableListings = new HashSet<>();
            sumByListing(scan(RESERVATION_KEY_PREFIX + "*"), heldByListing, unreadableListings);
            sumByListing(scan(PENDING_PURCHASE_KEY_PREFIX + "*"), heldByListing, unreadableListings);

            observedStock.forEach((listingIdStr, observed) -> {
                if (unreadableListings.contains(listingIdStr)) {
                    // An unreadable hold cannot be counted; correcting without it could hand out held units
                    log.warn("[STOCK RECONCILIATION] Listing {} has a non-numeric hold; skipped", listingIdStr);
                    return;
                }
                reconcileListing(listingIdStr, observed, heldByListing);
            });
        } catch (Exception ex) {
            log.error("Error during stock reservation reconciliation", ex);
        }
    }

    private void reconcileListing(String listingIdStr, String observed, Map<String, Integer> heldByListing) {
        UUID listingId;
        int observedStock;
        try {
            listingId = UUID.fromString(listingIdStr);
            observedStock = Integer.parseInt(observed);
        } catch (IllegalArgumentException ex) {
            log.warn("[STOCK RECONCILIATION] Skipping malformed stock key or value: {}={}", listingIdStr, observed);
            return;
        }

        inventoryRepository.findByListingId(listingId).ifPresent(inventory -> {
            int held = heldByListing.getOrDefault(listingIdStr, 0);
            int expected = inventory.getAvailableQuantity() - held;
            if (expected < 0) {
                log.warn("[STOCK RECONCILIATION] Listing {} holds ({}) exceed PostgreSQL available quantity ({}); clamping Redis stock to 0",
                        listingId, held, inventory.getAvailableQuantity());
                expected = 0;
            }
            if (observedStock == expected) {
                return;
            }
            boolean written = redisReservationService.compareAndSetStock(listingId, observed, expected);
            if (written) {
                log.warn("[STOCK RECONCILIATION] Listing {} stock drift healed. Redis: {} -> {} (DB available: {}, held: {})",
                        listingId, observedStock, expected, inventory.getAvailableQuantity(), held);
            } else {
                log.info("[STOCK RECONCILIATION] Listing {} stock changed during reconciliation; correction deferred to next run",
                        listingId);
            }
        });
    }

    // Reservation and pending-purchase keys both end with ":{listingId}" and hold a quantity
    private void sumByListing(List<String> keys, Map<String, Integer> heldByListing, Set<String> unreadableListings) {
        for (String key : keys) {
            String value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                continue; // expired between SCAN and GET
            }
            String listingIdStr = key.substring(key.lastIndexOf(':') + 1);
            try {
                heldByListing.merge(listingIdStr, Integer.parseInt(value), Integer::sum);
            } catch (NumberFormatException ex) {
                unreadableListings.add(listingIdStr);
            }
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

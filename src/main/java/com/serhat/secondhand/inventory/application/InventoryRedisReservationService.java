package com.serhat.secondhand.inventory.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.inventory.util.InventoryErrorCodes;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryRedisReservationService {

    private final StringRedisTemplate stringRedisTemplate;
    private final InventoryService inventoryService;

    private DefaultRedisScript<Long> reserveScript;
    private DefaultRedisScript<Long> releaseScript;
    private DefaultRedisScript<Long> reserveWithTtlScript;
    private DefaultRedisScript<Long> cancelUserReservationScript;
    private DefaultRedisScript<Long> compareAndSetStockScript;

    private static final long DEFAULT_RESERVATION_TTL_SECONDS = 900; // 15 minutes

    public static final String STOCK_KEY_PREFIX = "v4:inventory:stock:";
    public static final String RESERVATION_KEY_PREFIX = "v4:inventory:reservation:";
    public static final String PENDING_PURCHASE_KEY_PREFIX = "v4:inventory:pending:";

    // Satın alınmış ama PostgreSQL stoğundan henüz düşülmemiş miktar bu süre boyunca tutulur.
    // InventoryKafkaConsumer düşümü commit ettikten sonra işareti siler; süre yalnızca kaybolan silmeler için emniyettir.
    static final Duration PENDING_PURCHASE_TTL = Duration.ofHours(24);

    @PostConstruct
    public void init() {
        reserveScript = new DefaultRedisScript<>();
        reserveScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/reserve_stock.lua")));
        reserveScript.setResultType(Long.class);

        releaseScript = new DefaultRedisScript<>();
        releaseScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/release_stock.lua")));
        releaseScript.setResultType(Long.class);

        reserveWithTtlScript = new DefaultRedisScript<>();
        reserveWithTtlScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/reserve_stock_with_ttl.lua")));
        reserveWithTtlScript.setResultType(Long.class);

        cancelUserReservationScript = new DefaultRedisScript<>();
        cancelUserReservationScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/cancel_user_reservation.lua")));
        cancelUserReservationScript.setResultType(Long.class);

        compareAndSetStockScript = new DefaultRedisScript<>();
        compareAndSetStockScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/compare_and_set_stock.lua")));
        compareAndSetStockScript.setResultType(Long.class);
    }

    public void reserveStockWithTtl(Long userId, UUID listingId, int quantity, Long ttlSeconds) {
        String stockKey = getStockKey(listingId);
        String reservationKey = getReservationKey(userId, listingId);
        int currentDbStock = inventoryService.getAvailableQuantity(listingId);
        long effectiveTtl = (ttlSeconds != null && ttlSeconds > 0) ? ttlSeconds : DEFAULT_RESERVATION_TTL_SECONDS;

        Long result = stringRedisTemplate.execute(
                reserveWithTtlScript,
                List.of(stockKey, reservationKey),
                String.valueOf(quantity),
                String.valueOf(currentDbStock),
                String.valueOf(effectiveTtl)
        );

        if (result == null || result < 0) {
            log.warn("Insufficient stock in Redis for listing {}. Requested: {} by user: {}", listingId, quantity, userId);
            throw new BusinessException(InventoryErrorCodes.INSUFFICIENT_STOCK);
        }

        log.info("Successfully reserved {} items with TTL ({}s) for user {} on listing {}. Remaining: {}",
                quantity, effectiveTtl, userId, listingId, result);
    }

    public void cancelUserReservation(Long userId, UUID listingId) {
        String stockKey = getStockKey(listingId);
        String reservationKey = getReservationKey(userId, listingId);

        Long result = stringRedisTemplate.execute(
                cancelUserReservationScript,
                List.of(stockKey, reservationKey)
        );

        log.info("Cancelled reservation for user {} on listing {}. Restored: {}", userId, listingId, result != null && result > 0);
    }

    /**
     * Turns the buyer's reservation into a pending-purchase marker. Redis stock is not changed: the units stay
     * taken until InventoryKafkaConsumer deducts them in PostgreSQL and calls {@link #clearPendingPurchase}.
     * The marker is written before the reservation is deleted, so the reconciliation job never sees neither.
     */
    public void consumeReservationOnPurchase(Long userId, UUID listingId, Long orderItemId, int quantity) {
        String reservationKey = getReservationKey(userId, listingId);
        String pendingKey = getPendingPurchaseKey(orderItemId, listingId);
        stringRedisTemplate.opsForValue().set(pendingKey, String.valueOf(quantity), PENDING_PURCHASE_TTL);
        stringRedisTemplate.delete(reservationKey);
        log.info("Consumed reservation key {} upon successful purchase by user {}; pending deduction {} = {}",
                reservationKey, userId, pendingKey, quantity);
    }

    public void clearPendingPurchase(UUID listingId, Long orderItemId) {
        String pendingKey = getPendingPurchaseKey(orderItemId, listingId);
        stringRedisTemplate.delete(pendingKey);
        log.info("Cleared pending purchase marker {} after PostgreSQL stock deduction", pendingKey);
    }

    /**
     * Sets the Redis stock to {@code correctedStock} only if it still equals {@code observedStock}.
     * @return true when the correction was written, false when the stock changed concurrently
     */
    public boolean compareAndSetStock(UUID listingId, String observedStock, int correctedStock) {
        Long result = stringRedisTemplate.execute(
                compareAndSetStockScript,
                Collections.singletonList(getStockKey(listingId)),
                observedStock,
                String.valueOf(correctedStock)
        );
        return result != null && result == 1L;
    }

    public Long getReservationRemainingTtl(Long userId, UUID listingId) {
        if (userId == null || listingId == null) return 0L;
        String reservationKey = getReservationKey(userId, listingId);
        Long ttl = stringRedisTemplate.getExpire(reservationKey);
        return (ttl != null && ttl > 0) ? ttl : 0L;
    }

    public void reserveStock(UUID listingId, int quantity) {
        String stockKey = getStockKey(listingId);
        int currentDbStock = inventoryService.getAvailableQuantity(listingId);

        Long result = stringRedisTemplate.execute(
                reserveScript,
                Collections.singletonList(stockKey),
                String.valueOf(quantity),
                String.valueOf(currentDbStock)
        );

        if (result == null || result < 0) {
            log.warn("Insufficient stock in Redis for listing {}. Requested: {}", listingId, quantity);
            throw new BusinessException(InventoryErrorCodes.INSUFFICIENT_STOCK);
        }

        log.info("Successfully reserved {} items in Redis for listing {}. Remaining in Redis: {}", quantity, listingId, result);
    }

    public void releaseStock(UUID listingId, int quantity) {
        String stockKey = getStockKey(listingId);

        Long result = stringRedisTemplate.execute(
                releaseScript,
                Collections.singletonList(stockKey),
                String.valueOf(quantity)
        );

        if (result != null && result < 0) {
            log.info("Redis stock key for listing {} is absent; release of {} skipped, next reservation loads it from PostgreSQL",
                    listingId, quantity);
            return;
        }
        log.info("Released {} items in Redis for listing {}. New Redis stock: {}", quantity, listingId, result);
    }

    public void syncStockToRedis(UUID listingId, int availableQuantity) {
        String stockKey = getStockKey(listingId);
        stringRedisTemplate.opsForValue().set(stockKey, String.valueOf(availableQuantity));
        log.info("Synchronized stock to Redis for listing {}: {}", listingId, availableQuantity);
    }

    private String getStockKey(UUID listingId) {
        return STOCK_KEY_PREFIX + listingId;
    }

    private String getReservationKey(Long userId, UUID listingId) {
        return RESERVATION_KEY_PREFIX + userId + ":" + listingId;
    }

    // listingId is the last segment, like reservation keys, so both are summed per listing the same way
    private String getPendingPurchaseKey(Long orderItemId, UUID listingId) {
        return PENDING_PURCHASE_KEY_PREFIX + orderItemId + ":" + listingId;
    }
}

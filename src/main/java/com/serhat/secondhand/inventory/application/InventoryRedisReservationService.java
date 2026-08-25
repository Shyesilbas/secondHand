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

    private static final long DEFAULT_RESERVATION_TTL_SECONDS = 900; // 15 minutes

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

    public void consumeReservationOnPurchase(Long userId, UUID listingId) {
        String reservationKey = getReservationKey(userId, listingId);
        stringRedisTemplate.delete(reservationKey);
        log.info("Consumed reservation key {} upon successful purchase by user {}", reservationKey, userId);
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

        log.info("Released {} items in Redis for listing {}. New Redis stock: {}", quantity, listingId, result);
    }

    public void syncStockToRedis(UUID listingId, int availableQuantity) {
        String stockKey = getStockKey(listingId);
        stringRedisTemplate.opsForValue().set(stockKey, String.valueOf(availableQuantity));
        log.info("Synchronized stock to Redis for listing {}: {}", listingId, availableQuantity);
    }

    private String getStockKey(UUID listingId) {
        return "v4:inventory:stock:" + listingId;
    }

    private String getReservationKey(Long userId, UUID listingId) {
        return "v4:inventory:reservation:" + userId + ":" + listingId;
    }
}

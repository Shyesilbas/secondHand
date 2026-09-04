package com.serhat.secondhand.cart.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * High-performance, zero-DB Redis Set based tracker for "Active In Carts" social proof metrics.
 * Tracks distinct users who currently hold a listing in their cart.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CartSocialMetricService {

    private final StringRedisTemplate redisTemplate;

    private static final String KEY_PREFIX = "v4:cart:in_cart_users:";
    private static final Duration KEY_TTL = Duration.ofDays(7);

    private String getKey(UUID listingId) {
        return KEY_PREFIX + listingId;
    }

    /**
     * Records a distinct user adding a listing to their cart.
     */
    public void recordListingAddedToCart(UUID listingId, Long userId) {
        if (listingId == null || userId == null) return;
        try {
            String key = getKey(listingId);
            redisTemplate.opsForSet().add(key, userId.toString());
            redisTemplate.expire(key, KEY_TTL);
        } catch (Exception e) {
            log.warn("Failed to record cart addition in Redis for listing {}: {}", listingId, e.getMessage());
        }
    }

    /**
     * Records a distinct user removing a listing from their cart.
     */
    public void recordListingRemovedFromCart(UUID listingId, Long userId) {
        if (listingId == null || userId == null) return;
        try {
            String key = getKey(listingId);
            redisTemplate.opsForSet().remove(key, userId.toString());
        } catch (Exception e) {
            log.warn("Failed to record cart removal in Redis for listing {}: {}", listingId, e.getMessage());
        }
    }

    /**
     * Batch removal when multiple items or an entire cart is emptied for a user.
     */
    public void recordListingsRemovedFromCart(Collection<UUID> listingIds, Long userId) {
        if (listingIds == null || listingIds.isEmpty() || userId == null) return;
        try {
            String userStr = userId.toString();
            for (UUID listingId : listingIds) {
                if (listingId != null) {
                    redisTemplate.opsForSet().remove(getKey(listingId), userStr);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to batch remove cart items from Redis for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Returns the count of distinct users holding this listing in their active cart.
     * O(1) time complexity via Redis SCARD.
     */
    public int getInCartCount(UUID listingId) {
        if (listingId == null) return 0;
        try {
            Long count = redisTemplate.opsForSet().size(getKey(listingId));
            return count != null ? count.intValue() : 0;
        } catch (Exception e) {
            log.warn("Failed to get in-cart count from Redis for listing {}: {}", listingId, e.getMessage());
            return 0;
        }
    }

    /**
     * Batch returns in-cart counts for multiple listings using Redis pipeline.
     */
    public Map<UUID, Integer> getInCartCounts(List<UUID> listingIds) {
        if (listingIds == null || listingIds.isEmpty()) return Collections.emptyMap();
        try {
            List<Object> results = redisTemplate.executePipelined((org.springframework.data.redis.core.RedisCallback<Object>) connection -> {
                for (UUID id : listingIds) {
                    byte[] rawKey = getKey(id).getBytes();
                    connection.sCard(rawKey);
                }
                return null;
            });

            Map<UUID, Integer> map = new java.util.HashMap<>();
            for (int i = 0; i < listingIds.size(); i++) {
                Object res = (i < results.size()) ? results.get(i) : null;
                int count = 0;
                if (res instanceof Number num) {
                    count = num.intValue();
                }
                map.put(listingIds.get(i), count);
            }
            return map;
        } catch (Exception e) {
            log.warn("Failed to batch get in-cart counts from Redis: {}", e.getMessage());
            return listingIds.stream().collect(Collectors.toMap(id -> id, id -> 0));
        }
    }
}

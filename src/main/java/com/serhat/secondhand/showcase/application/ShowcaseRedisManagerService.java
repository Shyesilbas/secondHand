package com.serhat.secondhand.showcase.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowcaseRedisManagerService {

    private static final String SHOWCASE_ACTIVE_KEY_PREFIX = "showcase:active:";

    private final StringRedisTemplate redisTemplate;

    public void registerActiveShowcase(UUID showcaseId, UUID listingId, LocalDateTime endDate) {
        if (endDate == null) return;

        Duration ttl = Duration.between(LocalDateTime.now(), endDate);
        if (ttl.isNegative() || ttl.isZero()) return;

        String key = SHOWCASE_ACTIVE_KEY_PREFIX + listingId;
        try {
            redisTemplate.opsForValue().set(key, showcaseId.toString(), ttl);
            log.info("Registered active showcase in Redis for listing: {} (TTL: {} mins)", listingId, ttl.toMinutes());
        } catch (Exception e) {
            log.error("Failed to register active showcase in Redis for listing: {}", listingId, e);
        }
    }

    public boolean isShowcaseActive(UUID listingId) {
        String key = SHOWCASE_ACTIVE_KEY_PREFIX + listingId;
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("Failed to check active showcase in Redis for listing: {}", listingId, e);
            return false;
        }
    }

    public void removeShowcase(UUID listingId) {
        String key = SHOWCASE_ACTIVE_KEY_PREFIX + listingId;
        try {
            redisTemplate.delete(key);
            log.info("Removed active showcase from Redis for listing: {}", listingId);
        } catch (Exception e) {
            log.error("Failed to remove active showcase from Redis for listing: {}", listingId, e);
        }
    }
}

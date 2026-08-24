package com.serhat.secondhand.offer.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferRedisReservationService {

    private static final String OFFER_LOCK_KEY_PREFIX = "v4:offer:lock:";
    private static final Duration DEFAULT_OFFER_TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;

    public boolean lockAcceptedOffer(UUID listingId, Long buyerId, UUID offerId) {
        String key = OFFER_LOCK_KEY_PREFIX + listingId;
        String value = buyerId + ":" + offerId;

        try {
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, value, DEFAULT_OFFER_TTL);
            boolean success = Boolean.TRUE.equals(acquired);
            if (success) {
                log.info("Redis offer lock acquired for listing: {} by buyer: {} (offer: {})", listingId, buyerId, offerId);
            } else {
                log.warn("Redis offer lock already held for listing: {}", listingId);
            }
            return success;
        } catch (Exception e) {
            log.error("Redis offer lock failed for listing: {}, fallback to DB", listingId, e);
            return true; // Fallback to DB isolation on Redis failure
        }
    }

    public void releaseAcceptedOffer(UUID listingId) {
        String key = OFFER_LOCK_KEY_PREFIX + listingId;
        try {
            redisTemplate.delete(key);
            log.info("Redis offer lock released for listing: {}", listingId);
        } catch (Exception e) {
            log.error("Failed to release Redis offer lock for listing: {}", listingId, e);
        }
    }
}

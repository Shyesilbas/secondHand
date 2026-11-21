package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collection;
import java.util.Objects;

/**
 * Evicts the {@code payment:stats} entries of the users a money operation touched (payer, recipient,
 * buyer, sellers) instead of clearing every user's statistics.
 *
 * <p>The cache manager is transaction aware, so inside a transaction the evictions run after commit and
 * a rolled back operation evicts nothing.
 */
@Component
@RequiredArgsConstructor
public class PaymentStatsCacheEvictor {

    private final CacheManager cacheManager;

    public void evictUsers(User... users) {
        evictUserIds(Arrays.stream(users).filter(Objects::nonNull).map(User::getId).toList());
    }

    public void evictUserIds(Collection<Long> userIds) {
        Cache cache = cacheManager.getCache(PaymentStatsService.CACHE_NAME);
        if (cache == null) {
            throw new IllegalStateException("Cache not registered: " + PaymentStatsService.CACHE_NAME);
        }
        userIds.stream().filter(Objects::nonNull).distinct().forEach(userId -> {
            cache.evict(PaymentStatsService.cacheKey(userId, null));
            PaymentStatsService.CACHED_PROVIDER_FILTERS
                    .forEach(provider -> cache.evict(PaymentStatsService.cacheKey(userId, provider)));
        });
    }
}

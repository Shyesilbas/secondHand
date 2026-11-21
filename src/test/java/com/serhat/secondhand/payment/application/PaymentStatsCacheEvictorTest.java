package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentStatsCacheEvictorTest {

    private final ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(PaymentStatsService.CACHE_NAME);
    private final PaymentStatsCacheEvictor evictor = new PaymentStatsCacheEvictor(cacheManager);

    @Test
    void evictsEveryFilterOfTheAffectedUsersAndKeepsOtherUsers() {
        Cache cache = cacheManager.getCache(PaymentStatsService.CACHE_NAME);
        for (long userId = 1; userId <= 3; userId++) {
            cache.put(PaymentStatsService.cacheKey(userId, null), "all-" + userId);
            cache.put(PaymentStatsService.cacheKey(userId, "EWALLET"), "ewallet-" + userId);
        }

        evictor.evictUsers(User.builder().id(1L).build(), null, User.builder().id(2L).build());

        assertThat(cache.get(PaymentStatsService.cacheKey(1L, null))).isNull();
        assertThat(cache.get(PaymentStatsService.cacheKey(1L, "EWALLET"))).isNull();
        assertThat(cache.get(PaymentStatsService.cacheKey(2L, null))).isNull();
        assertThat(cache.get(PaymentStatsService.cacheKey(2L, "EWALLET"))).isNull();
        assertThat(cache.get(PaymentStatsService.cacheKey(3L, null)).get()).isEqualTo("all-3");
        assertThat(cache.get(PaymentStatsService.cacheKey(3L, "EWALLET")).get()).isEqualTo("ewallet-3");
    }
}

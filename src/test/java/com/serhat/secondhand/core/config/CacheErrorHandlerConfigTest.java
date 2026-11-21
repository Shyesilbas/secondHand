package com.serhat.secondhand.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.serializer.SerializationException;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A cache entry that cannot be read (or Redis being down) must fall through to the method, not fail the request.
 * Uses a minimal Spring context because the handler only takes effect through Spring's caching infrastructure.
 */
class CacheErrorHandlerConfigTest {

    @Test
    void unreadableEntryFallsThroughToTheMethodAndIsEvicted() {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(TestConfig.class)) {
            CachedService service = ctx.getBean(CachedService.class);
            BrokenCache cache = ctx.getBean(BrokenCache.class);

            assertThat(service.load()).isEqualTo("fresh");
            assertThat(service.callCount()).isEqualTo(1);
            assertThat(cache.evictions.get()).isEqualTo(1);
        }
    }

    @Configuration
    @EnableCaching
    @Import(CacheErrorHandlerConfig.class)
    static class TestConfig {
        @Bean
        BrokenCache brokenCache() {
            return new BrokenCache();
        }

        @Bean
        CacheManager cacheManager(BrokenCache brokenCache) {
            SimpleCacheManager manager = new SimpleCacheManager();
            manager.setCaches(List.of(brokenCache));
            return manager;
        }

        @Bean
        CachedService cachedService() {
            return new CachedService();
        }
    }

    /** Behaves like a Redis cache holding a value the serializer cannot read. */
    static class BrokenCache extends ConcurrentMapCache {
        final AtomicInteger evictions = new AtomicInteger();

        BrokenCache() {
            super("broken");
        }

        @Override
        public Cache.ValueWrapper get(Object key) {
            throw new SerializationException("Could not read JSON");
        }

        @Override
        public void evict(Object key) {
            evictions.incrementAndGet();
            super.evict(key);
        }
    }

    static class CachedService {
        final AtomicInteger calls = new AtomicInteger();

        @Cacheable(value = "broken", key = "'k'")
        public String load() {
            calls.incrementAndGet();
            return "fresh";
        }

        // Read through a method: fields of the Spring proxy itself are not the target's fields.
        public int callCount() {
            return calls.get();
        }
    }
}

package com.serhat.secondhand.core.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cache read/write hatalarında uygulamayı düşürmeden fallback davranışı sağlar.
 * Özellikle Redis deserialize kaynaklı geçici/bozuk key senaryolarında isteğin DB'ye düşmesini garanti eder.
 */
@Configuration
@Slf4j
public class CacheErrorHandlerConfig {

    @Bean
    public CacheErrorHandler cacheErrorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache GET error ignored | cache={} key={} type={} message={}",
                        cacheName(cache), key, exception.getClass().getSimpleName(), exception.getMessage());
                // Bozuk key tekrar okunmasın diye best-effort evict.
                safeEvict(cache, key);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache PUT error ignored | cache={} key={} type={} message={}",
                        cacheName(cache), key, exception.getClass().getSimpleName(), exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache EVICT error ignored | cache={} key={} type={} message={}",
                        cacheName(cache), key, exception.getClass().getSimpleName(), exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache CLEAR error ignored | cache={} type={} message={}",
                        cacheName(cache), exception.getClass().getSimpleName(), exception.getMessage());
            }

            private void safeEvict(Cache cache, Object key) {
                if (cache == null || key == null) {
                    return;
                }
                try {
                    cache.evict(key);
                } catch (RuntimeException evictEx) {
                    log.warn("Cache evict after get error failed | cache={} key={} type={} message={}",
                            cacheName(cache), key, evictEx.getClass().getSimpleName(), evictEx.getMessage());
                }
            }

            private String cacheName(Cache cache) {
                return cache == null ? "unknown" : cache.getName();
            }
        };
    }
}

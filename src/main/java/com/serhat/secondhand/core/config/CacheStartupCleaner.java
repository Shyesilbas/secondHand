package com.serhat.secondhand.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

/**
 * Uygulama her başlatıldığında cache'i temizler.
 * Cache config / serializer değişikliklerinde oluşan format çakışmalarını
 * (Unexpected token, missing type id vb.) kalıcı olarak önler.
 * Cache zaten ephemeral; restart sonrası lazy şekilde tekrar dolar.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class CacheStartupCleaner {

    private final CacheManager cacheManager;
    private final RedisConnectionFactory redisConnectionFactory;

    @EventListener(ApplicationReadyEvent.class)
    public void clearCachesOnStartup() {
        // 1) Spring Cache abstraction üzerinden temizlik (cacheManager'ın bildiği prefix'ler)
        try {
            for (String name : cacheManager.getCacheNames()) {
                Cache cache = cacheManager.getCache(name);
                if (cache != null) {
                    cache.clear();
                    log.info("Cache cleared on startup: {}", name);
                }
            }
        } catch (Exception e) {
            log.warn("Spring CacheManager clear failed: {}", e.getMessage());
        }

        // 2) Garanti olsun diye seçili Redis DB'yi de tamamen flush et
        // (eski format'tan kalan, prefix dışı anahtarları siler)
        try (var connection = redisConnectionFactory.getConnection()) {
            connection.serverCommands().flushDb();
            log.info("Redis DB flushed on startup to prevent serialization format conflicts");
        } catch (Exception e) {
            log.warn("Redis flushDb failed on startup: {}", e.getMessage());
        }
    }
}

package com.serhat.secondhand.core.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                "notificationCount",
                "chatUnreadCount",
                "pendingOrders",
                "cartItems",
                "userBadges",
                "favoriteStatsBatch",
                "reviewStatsBatch"
        );
        
        cacheManager.setCaffeine(caffeineCacheBuilder());
        log.info("Initialized in-memory cache with Caffeine (no external dependencies)");
        return cacheManager;
    }

    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(30, TimeUnit.SECONDS)
                .recordStats();
    }
}

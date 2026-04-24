package com.serhat.secondhand.core.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {

        // ObjectMapper: Java 8 date/time desteği + default typing (tip bilgisi koruması)
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder()
                        .allowIfBaseType(Object.class)
                        .build(),
                ObjectMapper.DefaultTyping.EVERYTHING
        );

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        // ── Varsayılan: 30 dakika ──────────────────────────────────────
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer));

        // ── Tier 1: Statik Lookup — 24 saat ────────────────────────────
        // Markalar, araç tipleri, elektronik tipleri vb. neredeyse hiç değişmez
        RedisCacheConfiguration lookupConfig = defaultConfig.entryTtl(Duration.ofHours(24));

        // ── Tier 2: Tamamlanmış İşlemler — 2 saat ──────────────────────
        // Statüsü artık değişmeyecek veriler (completed/cancelled/refunded orders, ödeme geçmişi)
        RedisCacheConfiguration completedConfig = defaultConfig.entryTtl(Duration.ofHours(2));

        // ── Tier 3: Aggregation — 10 dakika ────────────────────────────
        // Hesaplaması pahalı istatistikler (review/favori batch stats)
        RedisCacheConfiguration aggregationConfig = defaultConfig.entryTtl(Duration.ofMinutes(10));

        // ── Tier 3b: Kısa süreli — 5 dakika ───────────────────────────
        // Sık değişen ama yine de cache'lenebilir veriler
        RedisCacheConfiguration shortConfig = defaultConfig.entryTtl(Duration.ofMinutes(5));

        // ── Tier 4: Ultra Kısa — 30 saniye ────────────────────────────
        // Polling yapan badge'ler için DB yükünü azaltmak amacıyla
        RedisCacheConfiguration ultraShortConfig = defaultConfig.entryTtl(Duration.ofSeconds(30));

        // ── Tier 2b: Kullanıcı profili — 15 dakika ────────────────────
        // Kullanıcı bilgileri nadiren değişir ama güncel kalması önemli
        RedisCacheConfiguration profileConfig = defaultConfig.entryTtl(Duration.ofMinutes(15));

        log.info("Initialized Redis cache manager with tiered TTL strategy");

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)

                // Tier 1 — Statik lookup tabloları (24 saat)
                .withCacheConfiguration("brands", lookupConfig)
                .withCacheConfiguration("vehicleTypes", lookupConfig)
                .withCacheConfiguration("electronicTypes", lookupConfig)
                .withCacheConfiguration("bookGenres", lookupConfig)
                .withCacheConfiguration("clothingTypes", lookupConfig)

                // Tier 2 — Tamamlanmış işlemler (2 saat)
                .withCacheConfiguration("completedOrder", completedConfig)
                .withCacheConfiguration("paymentHistory", completedConfig)
                .withCacheConfiguration("paymentStats", completedConfig)

                // Tier 2b — Kullanıcı profili (15 dakika)
                .withCacheConfiguration("userProfile", profileConfig)

                // Tier 3 — Aggregation istatistikleri (10 dakika)
                .withCacheConfiguration("reviewStatsBatch", aggregationConfig)
                .withCacheConfiguration("favoriteStatsBatch", aggregationConfig)
                .withCacheConfiguration("sellerViewStats", aggregationConfig)

                // Tier 3b — Kısa süreli (5 dakika)
                .withCacheConfiguration("pendingOrders", shortConfig)
                .withCacheConfiguration("listingViewStats", shortConfig)
                .withCacheConfiguration("activeShowcases", shortConfig)

                // Tier 4 — Ultra Kısa (30 saniye)
                .withCacheConfiguration("userBadges", ultraShortConfig)

                .build();
    }
}

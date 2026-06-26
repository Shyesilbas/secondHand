package com.serhat.secondhand.core.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
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
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Tek noktada, deterministic ve <b>simetrik</b> Redis cache konfigürasyonu.
 *
 * <h3>Tasarım kararları</h3>
 * <ul>
 *   <li><b>Tek serializer:</b> {@link GenericJackson2JsonRedisSerializer} ile tek
 *       {@link ObjectMapper}. Projede başka {@code RedisTemplate} / serializer yoktur.</li>
 *   <li><b>Polymorphic typing:</b> {@code As.PROPERTY} (@class) +
 *       {@code DefaultTyping.EVERYTHING}. Yazma ve okuma <b>tüm seviyelerde</b>
 *       (root, nested, final) {@code @class} taşır → asimetri yoktur.
 *       {@code NON_FINAL} kullanılmaz çünkü {@code CachedPage} (record), UUID,
 *       enum gibi final tipler için {@code @class} yazılmaz, okurken aranır → fail.</li>
 *   <li><b>Domain DTO'larında @JsonTypeInfo bulunan tipler</b> (ListingDto,
 *       ListingFilterDto) Jackson tarafından öncelenir; default typing onların
 *       diskriminatörünü override etmez (ListingDto da {@code type}; filter DTO'da
 *       {@code listingType} kullanılır).</li>
 *   <li><b>Cache key versioning:</b> Tüm anahtarların başına {@code v4::} prefix
 *       eklenir. Eski v1/v2/v3 anahtarları erişilemez, TTL ile temizlenir.</li>
 *   <li><b>JavaTimeModule:</b> {@code LocalDateTime} ISO-8601 string olarak.</li>
 * </ul>
 */
@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    /** Cache key prefix versiyonu. Serializer/format değişimlerinde bumb edilir. */
    private static final String CACHE_VERSION = "v4";

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {

        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(buildCacheObjectMapper());

        // Tüm cache'lerin paylaştığı temel konfig.
        // computePrefixWith ile her cache name'in önüne "v<N>::" eklenir → eski versiyon anahtarlarıyla çakışmaz.
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .disableCachingNullValues()
                .computePrefixWith(cacheName -> CACHE_VERSION + "::" + cacheName + "::")
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer));

        // ── Tier 1: Statik Lookup — 24 saat ────────────────────────────
        RedisCacheConfiguration lookupConfig = defaultConfig.entryTtl(Duration.ofHours(24));

        // ── Tier 0: Coğrafi Katalog — 7 gün (restart-safe, JVM heap'te tutulmaz) ────
        RedisCacheConfiguration locationsConfig = defaultConfig.entryTtl(Duration.ofDays(7));

        // ── Tier 0b: AI Yorum Özetleri — 3 gün ────────────────────────────
        RedisCacheConfiguration aiSummariesConfig = defaultConfig.entryTtl(Duration.ofDays(3));

        // ── Tier 2: Tamamlanmış İşlemler — 2 saat ──────────────────────
        RedisCacheConfiguration completedConfig = defaultConfig.entryTtl(Duration.ofHours(2));

        // ── Tier 2b: Kullanıcı profili — 15 dakika ────────────────────
        RedisCacheConfiguration profileConfig = defaultConfig.entryTtl(Duration.ofMinutes(15));

        // ── Tier 3: Aggregation — 10 dakika ────────────────────────────
        RedisCacheConfiguration aggregationConfig = defaultConfig.entryTtl(Duration.ofMinutes(10));

        // ── Tier 3b: Kısa süreli — 5 dakika ───────────────────────────
        RedisCacheConfiguration shortConfig = defaultConfig.entryTtl(Duration.ofMinutes(5));

        // ── Tier 4: Ultra Kısa — 5 dakika ────────────────────────────
        RedisCacheConfiguration ultraShortConfig = defaultConfig.entryTtl(Duration.ofMinutes(5));

        log.info("Redis cache manager initialized | typing=As.PROPERTY EVERYTHING | keyPrefix={}::", CACHE_VERSION);

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)

                // Tier 0 — Coğrafi katalog (7 gün, restart'ta silinmez)
                .withCacheConfiguration("locations", locationsConfig)

                // Tier 0b — AI Yorum Özetleri (3 gün)
                .withCacheConfiguration("aiSummaries", aiSummariesConfig)

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

                // Tier 4 — Ultra Kısa (5 dakika)
                .withCacheConfiguration("userBadges", ultraShortConfig)

                .build();
    }

    /**
     * Genel amaçlı {@link RedisTemplate}&lt;String, Object&gt; bean'i.
     * {@link com.serhat.secondhand.listing.application.common.LocationCatalogService} tarafından
     * Spring Cache proxy dışında (self-call) doğrudan Redis'e veri yazmak için kullanılır.
     * CacheManager ile aynı JSON serializer'ı paylaşır → okunan tipler uyumludur.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(buildCacheObjectMapper());
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(jsonSerializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(jsonSerializer);
        template.afterPropertiesSet();
        return template;
    }

    /**
     * Cache için izole, deterministic bir ObjectMapper.
     * Web layer ObjectMapper'ından bağımsızdır; cache davranışı tek noktadan yönetilir.
     *
     * <p><b>EVERYTHING typing:</b> root + nested + leaf (final dahil) tüm seviyelerde
     * {@code @class} yazar. Read tarafıyla simetriktir — her seviyede {@code @class}
     * bulunur ve doğru tipe deserialize edilir.
     */
    @SuppressWarnings("deprecation") // Jackson 2.18+ DefaultTyping.EVERYTHING deprecated; gerekli (simetri için).
    private ObjectMapper buildCacheObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // LocalDateTime / LocalDate ISO-8601 string olarak yazılsın.
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Cache deserialize sırasında bilinmeyen alan / boş bean fail olmasın (forward-compat).
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        // Lombok / record / private alanlar düzgün okunsun (getter'a değil field'a bak).
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.NONE);
        mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);

        // Whitelist tabanlı typing — gadget attack korumalı, deserialize'a izinli paketler.
        BasicPolymorphicTypeValidator validator = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.serhat.secondhand")
                .allowIfSubType("java.util")
                .allowIfSubType("java.time")
                .allowIfSubType("java.lang")
                .allowIfSubType("java.math")
                .allowIfSubType("org.springframework.data.domain")
                .allowIfSubTypeIsArray()
                .build();

        // EVERYTHING + As.PROPERTY → her serialize edilen değere @class eklenir.
        // Domain DTO'larında @JsonTypeInfo varsa Jackson onu önceler (override edilmez).
        mapper.activateDefaultTyping(
                validator,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY
        );

        return mapper;
    }
}

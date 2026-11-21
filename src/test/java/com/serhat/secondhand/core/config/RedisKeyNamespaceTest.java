package com.serhat.secondhand.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * Spring caches and hand-written Redis keys share the {@code v4:} namespace. A cache whose prefix overlaps
 * a direct key (for example a cache named {@code inventory:stock}) would let an allEntries eviction SCAN-delete
 * stock reservations, or read a foreign value as a cache entry. Rename the cache, not the live key.
 */
class RedisKeyNamespaceTest {

    private static final Pattern DIRECT_KEY_LITERAL = Pattern.compile("\"(" + Pattern.quote(CacheConfig.CACHE_VERSION) + ":[^\"]*)\"");

    @Test
    void cachePrefixesDoNotOverlapDirectRedisKeys() throws IOException {
        RedisCacheManager cacheManager = (RedisCacheManager) new CacheConfig().cacheManager(mock(RedisConnectionFactory.class));
        cacheManager.initializeCaches();
        Set<String> cacheNames = Set.copyOf(cacheManager.getCacheNames());
        Set<String> directKeys = directKeyLiterals();
        assertThat(cacheNames).isNotEmpty();
        assertThat(directKeys).contains("v4:inventory:stock:", "v4:payment:idempotency:");

        List<String> overlaps = new ArrayList<>();
        for (String cacheName : cacheNames) {
            String cachePrefix = CacheConfig.CACHE_VERSION + ":" + cacheName + ":";
            for (String directKey : directKeys) {
                if (directKey.startsWith(cachePrefix) || cachePrefix.startsWith(directKey)) {
                    overlaps.add(cacheName + " <-> " + directKey);
                }
            }
        }
        assertThat(overlaps).as("cache names overlapping direct Redis keys").isEmpty();
    }

    private static Set<String> directKeyLiterals() throws IOException {
        Set<String> keys = new TreeSet<>();
        try (Stream<Path> files = Files.walk(Path.of("src/main/java"))) {
            for (Path file : files.filter(f -> f.toString().endsWith(".java")).toList()) {
                if (file.endsWith("CacheConfig.java")) continue;
                Matcher matcher = DIRECT_KEY_LITERAL.matcher(Files.readString(file));
                while (matcher.find()) {
                    keys.add(matcher.group(1));
                }
            }
        }
        return keys;
    }
}

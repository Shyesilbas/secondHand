package com.serhat.secondhand.listing.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@EnableCaching
public class ListingCacheConfig {

    public static final String BRANDS_CACHE = "brands";
    public static final String VEHICLE_TYPES_CACHE = "vehicleTypes";
    public static final String BOOK_GENRES_CACHE = "bookGenres";
    public static final String ELECTRONIC_TYPES_CACHE = "electronicTypes";
    public static final String CLOTHING_TYPES_CACHE = "clothingTypes";
    public static final String LISTING_STATS_CACHE = "listingStats";

    @Bean
    public CacheManager listingCacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
                new ConcurrentMapCache(BRANDS_CACHE),
                new ConcurrentMapCache(VEHICLE_TYPES_CACHE),
                new ConcurrentMapCache(BOOK_GENRES_CACHE),
                new ConcurrentMapCache(ELECTRONIC_TYPES_CACHE),
                new ConcurrentMapCache(CLOTHING_TYPES_CACHE),
                new ConcurrentMapCache(LISTING_STATS_CACHE)
        ));
        return cacheManager;
    }
}

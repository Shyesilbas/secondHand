package com.serhat.secondhand.favorite.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.favorite")
@Getter
@Setter
public class FavoriteApiConfig {

    private int userFavoritesDefaultSize = 20;
    private int topDefaultSize = 10;
    private int topListingsDefaultSize = 10;
    private int topListingsMaxSize = 100;

    public int resolveUserFavoritesSize(Integer requestedSize) {
        return normalizePositive(requestedSize, userFavoritesDefaultSize);
    }

    public int resolveTopSize(Integer requestedSize) {
        return normalizePositive(requestedSize, topDefaultSize);
    }

    public int resolveTopListingsSize(Integer requestedSize) {
        int resolved = normalizePositive(requestedSize, topListingsDefaultSize);
        return Math.min(resolved, topListingsMaxSize);
    }

    private int normalizePositive(Integer requested, int fallback) {
        if (requested == null || requested < 1) {
            return fallback;
        }
        return requested;
    }
}

package com.serhat.secondhand.favorite.domain.dto;

import java.io.Serial;
import java.util.HashMap;
import java.util.UUID;

/**
 * Favorite stats keyed by listing id. A named subclass so the Redis cache serializer records it as the
 * {@code @class} and Jackson restores UUID keys on a cache hit; a plain HashMap comes back with String keys,
 * which makes every UUID lookup miss.
 */
public class ListingFavoriteStatsMap extends HashMap<UUID, FavoriteStatsDto> {

    @Serial
    private static final long serialVersionUID = 1L;
}

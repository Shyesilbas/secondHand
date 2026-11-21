package com.serhat.secondhand.review.dto;

import java.io.Serial;
import java.util.HashMap;
import java.util.UUID;

/**
 * Review stats keyed by listing id. A named subclass so the Redis cache serializer records it as the
 * {@code @class} and Jackson restores UUID keys on a cache hit; a plain HashMap comes back with String keys,
 * which makes every UUID lookup miss.
 */
public class ListingReviewStatsMap extends HashMap<UUID, ReviewStatsDto> {

    @Serial
    private static final long serialVersionUID = 1L;
}

package com.serhat.secondhand.listing.domain.dto.response.listing;

import java.util.List;
import java.util.UUID;

/** Cached best-seller order: listing IDs only, so per-viewer fields (favorites, blocking) are resolved on read. */
public record BestSellerRanking(List<UUID> listingIds) {

    public BestSellerRanking {
        listingIds = listingIds == null ? List.of() : List.copyOf(listingIds);
    }
}

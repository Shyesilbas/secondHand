package com.serhat.secondhand.dashboard.service.port;

import java.util.UUID;

public interface FavoriteStatisticsPort {

    long countByListingSellerId(Long sellerId);

    long countByListingId(UUID listingId);
}


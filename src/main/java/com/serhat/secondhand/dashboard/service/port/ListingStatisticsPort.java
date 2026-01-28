package com.serhat.secondhand.dashboard.service.port;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListingStatisticsPort {
    long countBySellerId(Long sellerId);
    long countBySellerIdAndStatus(Long sellerId, ListingStatus status);

    List<Listing> findAllByIdIn(List<UUID> ids);

    Optional<Listing> findById(UUID id);
}


package com.serhat.secondhand.dashboard.service.port;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListingStatisticsPort {

    List<Listing> findBySellerId(Long sellerId);

    List<Listing> findBySellerIdAndStatus(Long sellerId, ListingStatus status);

    Optional<Listing> findById(UUID id);
}


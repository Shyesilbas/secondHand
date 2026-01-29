package com.serhat.secondhand.listing.detail;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;

import java.util.UUID;

public interface ListingDetailStrategy {
    String getDetailSummary(UUID listingId);
    boolean supports(ListingType type);
}


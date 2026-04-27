package com.serhat.secondhand.listing.detail;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;

public interface ListingDetailStrategy {
    String getDetailSummary(Listing listing);
    boolean supports(ListingType type);
}


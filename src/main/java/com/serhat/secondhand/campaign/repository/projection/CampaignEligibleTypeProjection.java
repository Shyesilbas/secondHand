package com.serhat.secondhand.campaign.repository.projection;

import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;

import java.util.UUID;

public interface CampaignEligibleTypeProjection {
    UUID getCampaignId();
    ListingType getListingType();
}


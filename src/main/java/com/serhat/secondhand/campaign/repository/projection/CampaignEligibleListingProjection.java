package com.serhat.secondhand.campaign.repository.projection;

import java.util.UUID;

public interface CampaignEligibleListingProjection {
    UUID getCampaignId();
    UUID getListingId();
}


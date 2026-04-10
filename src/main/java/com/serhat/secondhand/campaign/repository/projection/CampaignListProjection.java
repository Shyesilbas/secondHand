package com.serhat.secondhand.campaign.repository.projection;

import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public interface CampaignListProjection {
    UUID getId();
    String getName();
    boolean isActive();
    LocalDateTime getStartsAt();
    LocalDateTime getEndsAt();
    CampaignDiscountKind getDiscountKind();
    BigDecimal getValue();
    boolean isApplyToFutureListings();
}


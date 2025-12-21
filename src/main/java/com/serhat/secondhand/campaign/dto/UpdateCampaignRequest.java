package com.serhat.secondhand.campaign.dto;

import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCampaignRequest {
    private String name;
    private Boolean active;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private CampaignDiscountKind discountKind;
    private BigDecimal value;
    private Set<ListingType> eligibleTypes;
    private Set<UUID> eligibleListingIds;
}



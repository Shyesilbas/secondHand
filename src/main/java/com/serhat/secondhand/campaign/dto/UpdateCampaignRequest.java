package com.serhat.secondhand.campaign.dto;

import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(regexp = ".*\\S.*")
    private String name;
    private Boolean active;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private CampaignDiscountKind discountKind;
    @DecimalMin(value = "0.01", inclusive = true)
    @DecimalMax(value = "1000000000.00", inclusive = true)
    private BigDecimal value;
    private Set<ListingType> eligibleTypes;
    private Set<UUID> eligibleListingIds;
    private Boolean applyToFutureListings;
}



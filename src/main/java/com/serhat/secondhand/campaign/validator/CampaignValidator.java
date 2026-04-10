package com.serhat.secondhand.campaign.validator;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.entity.CampaignDiscountKind;
import com.serhat.secondhand.campaign.util.CampaignErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CampaignValidator {

    private final ListingRepository listingRepository;

    public Result<Void> validate(Campaign campaign, User seller) {
        Result<Void> basicsResult = validateBasics(campaign);
        if (basicsResult.isError()) {
            return basicsResult;
        }
        
        Result<Void> datesResult = validateCampaignDates(campaign);
        if (datesResult.isError()) {
            return datesResult;
        }
        
        Result<Void> typesResult = validateEligibleTypes(campaign);
        if (typesResult.isError()) {
            return typesResult;
        }
        
        return validateEligibleListings(campaign, seller);
    }

    private Result<Void> validateBasics(Campaign campaign) {
        if (campaign.getName() == null || campaign.getName().isBlank()) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        if (campaign.getDiscountKind() == null || campaign.getValue() == null) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        if (campaign.getValue().compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        if (campaign.getDiscountKind() == CampaignDiscountKind.PERCENT
                && campaign.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        return Result.success();
    }

    private Result<Void> validateCampaignDates(Campaign campaign) {
        LocalDateTime now = LocalDateTime.now();

        if (campaign.getStartsAt() != null && campaign.getEndsAt() != null
                && campaign.getStartsAt().isAfter(campaign.getEndsAt())) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_INVALID);
        }

        if (campaign.getEndsAt() != null && campaign.getEndsAt().isBefore(now)) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_EXPIRED);
        }
        
        return Result.success();
    }


    private Result<Void> validateEligibleTypes(Campaign campaign) {
        if (campaign.getEligibleTypes() == null) {
            return Result.success();
        }
        if (campaign.getEligibleTypes().contains(ListingType.REAL_ESTATE)
                || campaign.getEligibleTypes().contains(ListingType.VEHICLE)) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_NOT_ALLOWED_FOR_TYPE);
        }
        return Result.success();
    }
    
    private Result<Void> validateEligibleListings(Campaign campaign, User seller) {
        if (campaign.getEligibleListingIds() == null || campaign.getEligibleListingIds().isEmpty()) {
            return Result.success();
        }
        Set<java.util.UUID> eligibleIds = campaign.getEligibleListingIds();
        long totalCount = listingRepository.countByIdIn(eligibleIds);
        if (totalCount != eligibleIds.size()) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        long ownedCount = listingRepository.countByIdInAndSellerId(eligibleIds, seller.getId());
        if (ownedCount != eligibleIds.size()) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_NOT_OWNED);
        }
        if (listingRepository.existsByIdInAndListingTypeIn(
                eligibleIds,
                List.of(ListingType.REAL_ESTATE, ListingType.VEHICLE))) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_NOT_ALLOWED_FOR_TYPE);
        }
        
        return Result.success();
    }


}

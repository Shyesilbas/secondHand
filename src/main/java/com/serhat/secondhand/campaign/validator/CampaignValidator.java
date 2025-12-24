package com.serhat.secondhand.campaign.validator;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.util.CampaignErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CampaignValidator {

    private final ListingRepository listingRepository;

    public void validate(Campaign campaign, User seller) {
        validateBasics(campaign);
        validateDates(campaign);
        validateEligibleTypes(campaign);
        validateEligibleListings(campaign, seller);
    }

    private void validateBasics(Campaign campaign) {
        if (campaign.getName() == null || campaign.getName().isBlank()) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        if (campaign.getDiscountKind() == null || campaign.getValue() == null) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
    }

    private void validateDates(Campaign campaign) {
        if (campaign.getStartsAt() != null && campaign.getEndsAt() != null
                && campaign.getStartsAt().isAfter(campaign.getEndsAt())) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
    }

    private void validateEligibleTypes(Campaign campaign) {
        if (campaign.getEligibleTypes() == null) {
            return;
        }
        if (campaign.getEligibleTypes().contains(ListingType.REAL_ESTATE)
                || campaign.getEligibleTypes().contains(ListingType.VEHICLE)) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_ALLOWED_FOR_TYPE);
        }
    }
    private void validateEligibleListings(Campaign campaign, User seller) {
        if (campaign.getEligibleListingIds() == null || campaign.getEligibleListingIds().isEmpty()) {
            return;
        }

        List<Listing> listings = listingRepository.findAllById(campaign.getEligibleListingIds());
        if (listings.size() != campaign.getEligibleListingIds().size()) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
        }

        for (Listing listing : listings) {
            if (!listing.getSeller().getId().equals(seller.getId())) {
                throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_OWNED);
            }
            if (listing.getListingType() == ListingType.REAL_ESTATE
                    || listing.getListingType() == ListingType.VEHICLE) {
                throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_ALLOWED_FOR_TYPE);
            }
        }
    }


}

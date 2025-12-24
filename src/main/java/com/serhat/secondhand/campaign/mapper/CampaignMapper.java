package com.serhat.secondhand.campaign.mapper;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

@Component
public class CampaignMapper {

    public CampaignDto toDto(Campaign campaign) {
        return CampaignDto.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .active(campaign.isActive())
                .startsAt(campaign.getStartsAt())
                .endsAt(campaign.getEndsAt())
                .discountKind(campaign.getDiscountKind())
                .value(campaign.getValue())
                .eligibleTypes(campaign.getEligibleTypes())
                .eligibleListingIds(campaign.getEligibleListingIds())
                .build();
    }

    public void applyUpdate(Campaign campaign, UpdateCampaignRequest request) {
        if (request.getName() != null) {
            campaign.setName(request.getName());
        }
        if (request.getActive() != null) {
            campaign.setActive(request.getActive());
        }
        if (request.getStartsAt() != null) {
            campaign.setStartsAt(request.getStartsAt());
        }
        if (request.getEndsAt() != null) {
            campaign.setEndsAt(request.getEndsAt());
        }
        if (request.getDiscountKind() != null) {
            campaign.setDiscountKind(request.getDiscountKind());
        }
        if (request.getValue() != null) {
            campaign.setValue(request.getValue());
        }
        if (request.getEligibleTypes() != null) {
            campaign.setEligibleTypes(request.getEligibleTypes());
        }
        if (request.getEligibleListingIds() != null) {
            campaign.setEligibleListingIds(request.getEligibleListingIds());
        }
    }

    public Campaign fromCreateRequest(CreateCampaignRequest request, User seller) {
        return Campaign.builder()
                .seller(seller)
                .name(request.getName())
                .active(request.isActive())
                .startsAt(request.getStartsAt())
                .endsAt(request.getEndsAt())
                .discountKind(request.getDiscountKind())
                .value(request.getValue())
                .eligibleTypes(request.getEligibleTypes())
                .eligibleListingIds(request.getEligibleListingIds())
                .build();
    }

}

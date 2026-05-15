package com.serhat.secondhand.campaign.mapper;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.repository.projection.CampaignListProjection;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;

@Component
public class CampaignMapper {

    public AppliedCampaignDto toAppliedCampaignDto(Campaign campaign, BigDecimal discountAmount) {
        return new AppliedCampaignDto(
                campaign.getId(),
                campaign.getName(),
                campaign.getDiscountKind(),
                campaign.getValue(),
                discountAmount
        );
    }

    public CampaignDto toDto(Campaign campaign) {
        return CampaignDto.builder()
                .id(campaign.getId())
                .sellerId(campaign.getSeller() != null ? campaign.getSeller().getId() : null)
                .sellerName(campaign.getSeller() != null ? campaign.getSeller().getName() : null)
                .name(campaign.getName())
                .active(campaign.isActive())
                .startsAt(campaign.getStartsAt())
                .endsAt(campaign.getEndsAt())
                .discountKind(campaign.getDiscountKind())
                .value(campaign.getValue())
                .eligibleTypes(campaign.getEligibleTypes())
                .eligibleListingIds(campaign.getEligibleListingIds())
                .minQuantity(campaign.getMinQuantity())
                .applyToFutureListings(campaign.isApplyToFutureListings())
                .build();
    }

    public CampaignDto toDto(CampaignListProjection campaign) {
        return CampaignDto.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .active(campaign.isActive())
                .startsAt(campaign.getStartsAt())
                .endsAt(campaign.getEndsAt())
                .discountKind(campaign.getDiscountKind())
                .value(campaign.getValue())
                .eligibleTypes(new HashSet<>())
                .eligibleListingIds(new HashSet<>())
                .applyToFutureListings(campaign.isApplyToFutureListings())
                .build();
    }

    public void applyUpdate(Campaign campaign, UpdateCampaignRequest request) {
        if (request.getName() != null) {
            campaign.setName(request.getName());
        }
        if (request.isActive()) {
            campaign.setActive(request.isActive());
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
        if (request.getApplyToFutureListings() != null) {
            campaign.setApplyToFutureListings(request.getApplyToFutureListings());
        }
        if (request.getMinQuantity() != null) {
            campaign.setMinQuantity(request.getMinQuantity());
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
                .minQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 1)
                .applyToFutureListings(request.getApplyToFutureListings() != null ? request.getApplyToFutureListings() : false)
                .build();
    }

}

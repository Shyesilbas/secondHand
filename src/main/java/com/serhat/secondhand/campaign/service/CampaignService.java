package com.serhat.secondhand.campaign.service;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.repository.CampaignRepository;
import com.serhat.secondhand.campaign.util.CampaignErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final ListingRepository listingRepository;
    private final UserService userService;

    public CampaignDto create(CreateCampaignRequest request, Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);

        Campaign campaign = Campaign.builder()
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

        validateCampaign(campaign, seller);
        campaign = campaignRepository.save(campaign);
        return toDto(campaign);
    }

    public CampaignDto update(UUID id, UpdateCampaignRequest request, Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_FOUND));

        if (!campaign.getSeller().getId().equals(seller.getId())) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_OWNED);
        }

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

        validateCampaign(campaign, seller);
        campaign = campaignRepository.save(campaign);
        return toDto(campaign);
    }

    public void delete(UUID id, Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_FOUND));
        if (!campaign.getSeller().getId().equals(seller.getId())) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_OWNED);
        }
        campaignRepository.delete(campaign);
    }

    @Transactional(readOnly = true)
    public List<CampaignDto> listMyCampaigns(Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);
        return campaignRepository.findBySellerOrderByCreatedAtDesc(seller).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<Campaign> loadActiveCampaignsForSellers(List<Long> sellerIds) {
        if (sellerIds == null || sellerIds.isEmpty()) {
            return List.of();
        }
        return campaignRepository.findActiveCampaignsForSellers(sellerIds, LocalDateTime.now());
    }

    private void validateCampaign(Campaign campaign, User seller) {
        if (campaign.getName() == null || campaign.getName().isBlank()) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        if (campaign.getDiscountKind() == null || campaign.getValue() == null) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
        }
        if (campaign.getStartsAt() != null && campaign.getEndsAt() != null && campaign.getStartsAt().isAfter(campaign.getEndsAt())) {
            throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
        }

        if (campaign.getEligibleTypes() != null) {
            if (campaign.getEligibleTypes().contains(ListingType.REAL_ESTATE) || campaign.getEligibleTypes().contains(ListingType.VEHICLE)) {
                throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_ALLOWED_FOR_TYPE);
            }
        }

        if (campaign.getEligibleListingIds() != null && !campaign.getEligibleListingIds().isEmpty()) {
            List<Listing> listings = listingRepository.findAllById(campaign.getEligibleListingIds());
            if (listings.size() != campaign.getEligibleListingIds().size()) {
                throw new BusinessException(CampaignErrorCodes.CAMPAIGN_INVALID);
            }

            for (Listing listing : listings) {
                if (!listing.getSeller().getId().equals(seller.getId())) {
                    throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_OWNED);
                }
                if (listing.getListingType() == ListingType.REAL_ESTATE || listing.getListingType() == ListingType.VEHICLE) {
                    throw new BusinessException(CampaignErrorCodes.CAMPAIGN_NOT_ALLOWED_FOR_TYPE);
                }
            }
        }
    }

    private CampaignDto toDto(Campaign campaign) {
        Set<UUID> eligibleListingIds = campaign.getEligibleListingIds() == null ? Set.of() : campaign.getEligibleListingIds();
        Set<ListingType> eligibleTypes = campaign.getEligibleTypes() == null ? Set.of() : campaign.getEligibleTypes();
        return CampaignDto.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .active(campaign.isActive())
                .startsAt(campaign.getStartsAt())
                .endsAt(campaign.getEndsAt())
                .discountKind(campaign.getDiscountKind())
                .value(campaign.getValue())
                .eligibleTypes(eligibleTypes)
                .eligibleListingIds(eligibleListingIds)
                .build();
    }
}


package com.serhat.secondhand.campaign.application;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.mapper.CampaignMapper;
import com.serhat.secondhand.campaign.repository.CampaignRepository;
import com.serhat.secondhand.campaign.util.CampaignErrorCodes;
import com.serhat.secondhand.campaign.validator.CampaignValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CampaignService implements ICampaignService {

    private final CampaignRepository campaignRepository;
    private final IUserService userService;
    private final CampaignValidator campaignValidator;
    private final CampaignMapper campaignMapper;

    public Result<CampaignDto> create(Long userId, CreateCampaignRequest request) {
        Result<User> sellerResult = findSellerById(userId);
        if (sellerResult.isError()) return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        User seller = sellerResult.getData();

        Campaign campaign = campaignMapper.fromCreateRequest(request, seller);

        Result<Void> validationResult = campaignValidator.validate(campaign, seller);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        return Result.success(campaignMapper.toDto(campaignRepository.save(campaign)));
    }

    public Result<CampaignDto> update(Long userId, UUID id, UpdateCampaignRequest request) {
        Result<User> sellerResult = findSellerById(userId);
        if (sellerResult.isError()) return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        User seller = sellerResult.getData();

        Result<Campaign> campaignResult = findOwnedCampaign(id, seller);
        if (campaignResult.isError()) return Result.error(campaignResult.getMessage(), campaignResult.getErrorCode());
        Campaign campaign = campaignResult.getData();

        campaignMapper.applyUpdate(campaign, request);

        Result<Void> validationResult = campaignValidator.validate(campaign, seller);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        return Result.success(campaignMapper.toDto(campaignRepository.save(campaign)));
    }

    public Result<Void> delete(Long userId, UUID id) {
        Result<User> sellerResult = findSellerById(userId);
        if (sellerResult.isError()) return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        User seller = sellerResult.getData();

        Result<Campaign> campaignResult = findOwnedCampaign(id, seller);
        if (campaignResult.isError()) return Result.error(campaignResult.getMessage(), campaignResult.getErrorCode());
        Campaign campaign = campaignResult.getData();
        
        campaignRepository.delete(campaign);
        return Result.success();
    }

    @Transactional(readOnly = true)
    public Page<CampaignDto> listMyCampaigns(Long userId, Pageable pageable) {
        return campaignRepository.findPageSummaryBySellerId(userId, pageable)
                .map(campaignMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<Campaign> loadActiveCampaignsForSellers(List<Long> sellerIds) {
        if (sellerIds == null || sellerIds.isEmpty()) return List.of();

        List<Campaign> campaigns = campaignRepository.findAllActiveBySellerIds(sellerIds);
        if (campaigns.isEmpty()) {
            return campaigns;
        }
        hydrateEligibleCollections(campaigns);
        return campaigns;
    }

    private Result<Void> assertOwnedBySeller(Campaign campaign, User seller) {
        if (!campaign.getSeller().getId().equals(seller.getId())) {
            return Result.error(CampaignErrorCodes.CAMPAIGN_NOT_OWNED);
        }
        return Result.success();
    }

    private Result<Campaign> findCampaignById(UUID id) {
        return campaignRepository.findById(id)
                .map(Result::success)
                .orElse(Result.error(CampaignErrorCodes.CAMPAIGN_NOT_FOUND));
    }

    private Result<User> findSellerById(Long userId) {
        var sellerResult = userService.findById(userId);
        if (sellerResult.isError()) {
            return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        }
        return Result.success(sellerResult.getData());
    }

    private Result<Campaign> findOwnedCampaign(UUID id, User seller) {
        Result<Campaign> campaignResult = findCampaignById(id);
        if (campaignResult.isError()) {
            return campaignResult;
        }
        Campaign campaign = campaignResult.getData();
        Result<Void> ownershipResult = assertOwnedBySeller(campaign, seller);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }
        return Result.success(campaign);
    }

    private void hydrateEligibleCollections(List<Campaign> campaigns) {
        List<UUID> campaignIds = campaigns.stream().map(Campaign::getId).toList();

        Map<UUID, Set<ListingType>> typesByCampaign = new HashMap<>();
        campaignRepository.findEligibleTypesByCampaignIds(campaignIds)
                .forEach(row -> typesByCampaign
                        .computeIfAbsent(row.getCampaignId(), key -> new HashSet<>())
                        .add(row.getListingType()));

        Map<UUID, Set<UUID>> listingIdsByCampaign = new HashMap<>();
        campaignRepository.findEligibleListingIdsByCampaignIds(campaignIds)
                .forEach(row -> listingIdsByCampaign
                        .computeIfAbsent(row.getCampaignId(), key -> new HashSet<>())
                        .add(row.getListingId()));

        campaigns.forEach(campaign -> {
            campaign.setEligibleTypes(new HashSet<>(typesByCampaign.getOrDefault(campaign.getId(), Set.of())));
            campaign.setEligibleListingIds(new HashSet<>(listingIdsByCampaign.getOrDefault(campaign.getId(), Set.of())));
        });
    }
}

package com.serhat.secondhand.campaign.service;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.mapper.CampaignMapper;
import com.serhat.secondhand.campaign.repository.CampaignRepository;
import com.serhat.secondhand.campaign.util.CampaignErrorCodes;
import com.serhat.secondhand.campaign.validator.CampaignValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserService userService;
    private final CampaignValidator campaignValidator;
    private final CampaignMapper campaignMapper;

    public Result<CampaignDto> create(CreateCampaignRequest request, Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);

        Campaign campaign = campaignMapper.fromCreateRequest(request, seller);

        Result<Void> validationResult = campaignValidator.validate(campaign, seller);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        return Result.success(campaignMapper.toDto(campaignRepository.save(campaign)));
    }

    public Result<CampaignDto> update(UUID id, UpdateCampaignRequest request, Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);

        Result<Campaign> campaignResult = findCampaignById(id);
        if (campaignResult.isError()) {
            return Result.error(campaignResult.getMessage(), campaignResult.getErrorCode());
        }

        Campaign campaign = campaignResult.getData();

        Result<Void> ownershipResult = assertOwnedBySeller(campaign, seller);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        campaignMapper.applyUpdate(campaign, request);

        Result<Void> validationResult = campaignValidator.validate(campaign, seller);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        return Result.success(campaignMapper.toDto(campaignRepository.save(campaign)));
    }

    public Result<Void> delete(UUID id, Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);

        Result<Campaign> campaignResult = findCampaignById(id);
        if (campaignResult.isError()) {
            return Result.error(campaignResult.getMessage(), campaignResult.getErrorCode());
        }

        Campaign campaign = campaignResult.getData();

        Result<Void> ownershipResult = assertOwnedBySeller(campaign, seller);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }
        
        campaignRepository.delete(campaign);
        return Result.success();
    }

    @Transactional(readOnly = true)
    public List<CampaignDto> listMyCampaigns(Authentication authentication) {
        User seller = userService.getAuthenticatedUser(authentication);
        return campaignRepository.findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .map(campaignMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Campaign> loadActiveCampaignsForSellers(List<Long> sellerIds) {
        if (sellerIds == null || sellerIds.isEmpty()) {
            return List.of();
        }
        return campaignRepository.findActiveCampaignsForSellers(sellerIds, LocalDateTime.now());
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
}

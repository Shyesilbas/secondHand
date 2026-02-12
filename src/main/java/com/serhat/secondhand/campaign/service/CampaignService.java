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
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        var sellerResult = userService.findById(userId);
        if (sellerResult.isError()) {
            return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        }
        User seller = sellerResult.getData();

        Campaign campaign = campaignMapper.fromCreateRequest(request, seller);

        Result<Void> validationResult = campaignValidator.validate(campaign, seller);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        return Result.success(campaignMapper.toDto(campaignRepository.save(campaign)));
    }

    public Result<CampaignDto> update(Long userId, UUID id, UpdateCampaignRequest request) {
        var sellerResult = userService.findById(userId);
        if (sellerResult.isError()) {
            return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        }
        User seller = sellerResult.getData();

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

    public Result<Void> delete(Long userId, UUID id) {
        var sellerResult = userService.findById(userId);
        if (sellerResult.isError()) {
            return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        }
        User seller = sellerResult.getData();

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
    public Page<CampaignDto> listMyCampaigns(Long userId, Pageable pageable) {
        if (!userService.existsById(userId)) {
            return Page.empty(pageable);
        }

        return campaignRepository.findBySellerIdOrderByCreatedAtDesc(userId, pageable)
                .map(campaignMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<Campaign> loadActiveCampaignsForSellers(List<Long> sellerIds) {
        if (sellerIds == null || sellerIds.isEmpty()) return List.of();

        return campaignRepository.findAllActiveBySellerIdsWithDetails(sellerIds);
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

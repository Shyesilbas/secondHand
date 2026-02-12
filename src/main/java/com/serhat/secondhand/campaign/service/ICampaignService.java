package com.serhat.secondhand.campaign.service;

import com.serhat.secondhand.campaign.dto.CampaignDto;
import com.serhat.secondhand.campaign.dto.CreateCampaignRequest;
import com.serhat.secondhand.campaign.dto.UpdateCampaignRequest;
import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.core.result.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ICampaignService {
    
    Result<CampaignDto> create(Long userId, CreateCampaignRequest request);
    
    Result<CampaignDto> update(Long userId, UUID id, UpdateCampaignRequest request);
    
    Result<Void> delete(Long userId, UUID id);
    
    Page<CampaignDto> listMyCampaigns(Long userId, Pageable pageable);
    
    List<Campaign> loadActiveCampaignsForSellers(List<Long> sellerIds);
}

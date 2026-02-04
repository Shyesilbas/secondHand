package com.serhat.secondhand.campaign.service;

import com.serhat.secondhand.campaign.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CampaignScheduler {

    private final CampaignRepository campaignRepository;

    @Scheduled(fixedDelay = 600000)
    @Transactional
    public void deactivateExpiredCampaigns() {
        LocalDateTime now = LocalDateTime.now();
        campaignRepository.deactivateAllExpired(now);
    }

}

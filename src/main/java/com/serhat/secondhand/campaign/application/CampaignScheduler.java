package com.serhat.secondhand.campaign.application;

import com.serhat.secondhand.campaign.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class CampaignScheduler {

    private final CampaignRepository campaignRepository;

    @Scheduled(fixedDelayString = "#{@campaignConfigProperties.schedulerDeactivateFixedDelayMs}")
    @Transactional
    public void deactivateExpiredCampaigns() {
        LocalDateTime now = LocalDateTime.now();
        int deactivatedCount = campaignRepository.deactivateAllExpired(now);
        if (deactivatedCount > 0) {
            log.info("Deactivated {} expired campaigns", deactivatedCount);
        }
    }

}

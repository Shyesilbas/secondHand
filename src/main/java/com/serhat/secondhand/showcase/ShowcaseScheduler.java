package com.serhat.secondhand.showcase;

import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.showcase.application.ShowcaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShowcaseScheduler {
    
    private final ShowcaseService showcaseService;
    private final ShowcaseConfig showcaseConfig;
    
    @Scheduled(cron = "#{@showcaseConfig.scheduler.expireCron}")
    public void expireShowcases() {
        showcaseService.expireShowcases();
    }
}

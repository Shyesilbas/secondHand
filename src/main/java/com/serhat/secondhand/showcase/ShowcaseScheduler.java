package com.serhat.secondhand.showcase;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShowcaseScheduler {
    
    private final ShowcaseService showcaseService;
    
    @Scheduled(cron = "0 0 0 * * ?") // Her gün gece yarısı çalışır
    public void expireShowcases() {
        showcaseService.expireShowcases();
    }
}

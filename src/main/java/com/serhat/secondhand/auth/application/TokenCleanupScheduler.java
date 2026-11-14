package com.serhat.secondhand.auth.application;

import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final TokenService tokenService;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    @SchedulerLock(name = "tokenCleanupScheduler", lockAtMostFor = "PT4M30S", lockAtLeastFor = "PT30S")
    public void cleanupExpiredTokens() {
        tokenService.cleanupExpiredTokens();
    }
}
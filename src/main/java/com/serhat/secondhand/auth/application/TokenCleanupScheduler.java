package com.serhat.secondhand.auth.application;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final TokenService tokenService;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void cleanupExpiredTokens() {
        tokenService.cleanupExpiredTokens();
    }
}
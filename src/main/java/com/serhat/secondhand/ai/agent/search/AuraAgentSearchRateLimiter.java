package com.serhat.secondhand.ai.agent.search;

import com.serhat.secondhand.ai.application.GlobalGeminiBudgetGuard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Kullanıcı başına canlı ilan araması hız sınırı (varsayılan: dakikada 12, Redis sabit pencere).
 */
@Component
public class AuraAgentSearchRateLimiter {

    private static final String KEY_PREFIX = "v4:rate_limit:aura_search:user:";

    private final GlobalGeminiBudgetGuard budgetGuard;

    @Value("${aura.agent.search.rate-limit-per-minute:12}")
    private int maxPerMinute = 12;

    @Value("${aura.agent.search.rate-limit-window-ms:60000}")
    private long windowMs = 60000L;

    public AuraAgentSearchRateLimiter() {
        this(null);
    }

    @Autowired
    public AuraAgentSearchRateLimiter(@Autowired(required = false) GlobalGeminiBudgetGuard budgetGuard) {
        this.budgetGuard = budgetGuard;
    }

    public boolean tryAcquire(Long userId) {
        if (userId == null) {
            return false;
        }
        if (budgetGuard == null) {
            return false;
        }
        return budgetGuard.tryConsumeWindow(KEY_PREFIX + userId, maxPerMinute, Duration.ofMillis(windowMs));
    }
}

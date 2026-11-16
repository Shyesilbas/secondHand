package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Shared Redis-backed quota & cooldown guard for all Gemini API callers.
 * Fails closed when Redis is unavailable so upstream AI spend stays bounded.
 */
@Component
@Slf4j
public class GlobalGeminiBudgetGuard {

    private static final String DAILY_BUDGET_KEY_PREFIX = "v4:ai:budget:daily:";
    private static final long DAILY_BUDGET_TTL_MS = Duration.ofHours(25).toMillis();
    private static final ZoneId APP_ZONE = ZoneId.of("Europe/Istanbul");

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<Long> windowScript;

    @Value("${gemini.api.daily-global-limit:250}")
    private int dailyGlobalLimit = 250;

    public GlobalGeminiBudgetGuard(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.windowScript = new DefaultRedisScript<>();
        this.windowScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/rate_limit_window.lua")));
        this.windowScript.setResultType(Long.class);
    }

    @PostConstruct
    void initLog() {
        log.info("GlobalGeminiBudgetGuard initialized with dailyGlobalLimit={}", dailyGlobalLimit);
    }

    public void checkAndConsumeDailyBudget() {
        if (dailyGlobalLimit <= 0) {
            return;
        }
        String key = DAILY_BUDGET_KEY_PREFIX + LocalDate.now(APP_ZONE);
        Long count;
        try {
            count = redisTemplate.execute(windowScript, List.of(key), String.valueOf(DAILY_BUDGET_TTL_MS));
        } catch (DataAccessException e) {
            log.error("AI daily budget check failed (Redis unavailable): {}", e.getMessage());
            throw new BusinessException(AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED);
        }
        if (count == null || count > dailyGlobalLimit) {
            log.warn("Global daily Gemini budget exceeded: count={}, limit={}", count, dailyGlobalLimit);
            throw new BusinessException(AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED);
        }
    }

    public boolean tryConsumeWindow(String keyPrefix, int limit, Duration window) {
        if (limit <= 0) {
            return false;
        }
        long windowMs = Math.max(1000L, window.toMillis());
        long windowIndex = System.currentTimeMillis() / windowMs;
        String key = keyPrefix + ":" + windowIndex;
        try {
            Long count = redisTemplate.execute(windowScript, List.of(key), String.valueOf(windowMs));
            return count != null && count <= limit;
        } catch (DataAccessException e) {
            log.error("AI Redis window check failed for {}: {}", keyPrefix, e.getMessage());
            return false;
        }
    }

    public boolean isInCooldown(String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (DataAccessException e) {
            log.warn("Failed to read AI cooldown key {}: {}", key, e.getMessage());
            return false;
        }
    }

    public void markCooldown(String key, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, "1", ttl);
        } catch (DataAccessException e) {
            log.warn("Failed to set AI cooldown key {}: {}", key, e.getMessage());
        }
    }
}

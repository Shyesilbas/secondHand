package com.serhat.secondhand.complaint.queue;

import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.core.result.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Per-user complaint quota ({@code app.moderation.daily-complaint-limit} per
 * {@code app.moderation.daily-limit-window}), counted atomically by {@code rate_limit_window.lua}.
 * Fails closed: when Redis is unreachable no complaint is accepted.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ComplaintRateLimiter {

    public static final String KEY_PREFIX = "v4:rate_limit:complaint:user:";

    private static final DefaultRedisScript<Long> WINDOW_SCRIPT = windowScript();

    private final StringRedisTemplate redisTemplate;
    private final ComplaintModerationProperties properties;

    /** Consumes one slot; the slot stays used even if the complaint is later rejected. */
    public Result<Void> consume(Long userId) {
        Long count;
        try {
            count = redisTemplate.execute(WINDOW_SCRIPT, List.of(KEY_PREFIX + userId),
                    String.valueOf(properties.getDailyLimitWindow().toMillis()));
        } catch (DataAccessException e) {
            log.error("Complaint rate limiter unavailable for user {}", userId, e);
            return Result.error(ComplaintErrorCodes.COMPLAINT_RATE_LIMIT_UNAVAILABLE);
        }
        if (count == null) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_RATE_LIMIT_UNAVAILABLE);
        }
        if (count > properties.getDailyComplaintLimit()) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_DAILY_LIMIT_REACHED);
        }
        return Result.success();
    }

    private static DefaultRedisScript<Long> windowScript() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/rate_limit_window.lua")));
        script.setResultType(Long.class);
        return script;
    }
}

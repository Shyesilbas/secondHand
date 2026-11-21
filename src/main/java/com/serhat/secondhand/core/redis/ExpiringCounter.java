package com.serhat.secondhand.core.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * Attempt counters (failed logins, OTP failures, reset requests). INCR and the expiry run in one Lua call, so a
 * counter can never be left without a TTL: two separate commands (SET NX then INCR, or INCR then EXPIRE) can,
 * and such a key keeps its owner locked out until someone deletes it by hand.
 */
@Component
@RequiredArgsConstructor
public class ExpiringCounter {

    static final DefaultRedisScript<Long> INCREMENT_SCRIPT = script();

    private final StringRedisTemplate redisTemplate;

    /** Increments {@code key} and returns the new count; the key expires {@code window} after its first hit. */
    public long increment(String key, Duration window) {
        Long count = redisTemplate.execute(INCREMENT_SCRIPT, List.of(key), String.valueOf(window.toMillis()));
        if (count == null) {
            throw new IllegalStateException("Redis counter script returned null for " + key);
        }
        return count;
    }

    private static DefaultRedisScript<Long> script() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/rate_limit_window.lua")));
        script.setResultType(Long.class);
        return script;
    }
}

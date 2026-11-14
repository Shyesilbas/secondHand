package com.serhat.secondhand.complaint.queue;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Cluster-wide lock so only one instance runs the review worker at a time.
 * Taken with {@code SET NX PX}; released through {@code release_lock.lua} only by its owner.
 */
@Component
@RequiredArgsConstructor
public class ComplaintWorkerLock {

    public static final String LOCK_KEY = "v4:lock:complaint:worker";

    private static final DefaultRedisScript<Long> RELEASE_SCRIPT = releaseScript();

    private final StringRedisTemplate redisTemplate;

    /** Returns the owner token when the lock was taken, empty when another instance holds it. */
    public Optional<String> tryAcquire(Duration ttl) {
        String token = UUID.randomUUID().toString();
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(LOCK_KEY, token, ttl);
        return Boolean.TRUE.equals(acquired) ? Optional.of(token) : Optional.empty();
    }

    public void release(String token) {
        redisTemplate.execute(RELEASE_SCRIPT, List.of(LOCK_KEY), token);
    }

    private static DefaultRedisScript<Long> releaseScript() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/release_lock.lua")));
        script.setResultType(Long.class);
        return script;
    }
}

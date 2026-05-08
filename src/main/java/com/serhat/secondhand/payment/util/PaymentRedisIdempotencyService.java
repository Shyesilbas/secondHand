package com.serhat.secondhand.payment.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PaymentRedisIdempotencyService {

    public enum ClaimResult {
        ACQUIRED,
        ALREADY_COMPLETED,
        IN_PROGRESS,
        CONFLICT
    }

    private static final String KEY_PREFIX = "payment:idem:";
    private static final String STATE_PENDING = "PENDING";
    private static final String STATE_DONE = "DONE";

    private final StringRedisTemplate redisTemplate;

    public ClaimResult claim(String idempotencyKey, String fingerprint) {
        String redisKey = toRedisKey(idempotencyKey);
        String pendingValue = buildValue(STATE_PENDING, fingerprint);
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(redisKey, pendingValue, Duration.ofHours(PaymentProcessingConstants.IDEMPOTENCY_LOCK_TTL_HOURS));

        if (Boolean.TRUE.equals(acquired)) {
            return ClaimResult.ACQUIRED;
        }

        String existing = redisTemplate.opsForValue().get(redisKey);
        if (existing == null) {
            return ClaimResult.IN_PROGRESS;
        }

        ParsedState parsed = parseValue(existing);
        if (!Objects.equals(parsed.fingerprint(), fingerprint)) {
            return ClaimResult.CONFLICT;
        }
        return STATE_DONE.equals(parsed.state()) ? ClaimResult.ALREADY_COMPLETED : ClaimResult.IN_PROGRESS;
    }

    public void markCompleted(String idempotencyKey, String fingerprint) {
        String redisKey = toRedisKey(idempotencyKey);
        String doneValue = buildValue(STATE_DONE, fingerprint);
        redisTemplate.opsForValue()
                .set(redisKey, doneValue, Duration.ofHours(PaymentProcessingConstants.IDEMPOTENCY_RESULT_TTL_HOURS));
    }

    public void releaseIfPending(String idempotencyKey, String fingerprint) {
        String redisKey = toRedisKey(idempotencyKey);
        String existing = redisTemplate.opsForValue().get(redisKey);
        if (existing == null) {
            return;
        }
        ParsedState parsed = parseValue(existing);
        if (STATE_PENDING.equals(parsed.state()) && Objects.equals(parsed.fingerprint(), fingerprint)) {
            redisTemplate.delete(redisKey);
        }
    }

    private String toRedisKey(String idempotencyKey) {
        return KEY_PREFIX + idempotencyKey;
    }

    private String buildValue(String state, String fingerprint) {
        return state + ":" + fingerprint;
    }

    private ParsedState parseValue(String value) {
        int idx = value.indexOf(':');
        if (idx < 0) {
            return new ParsedState(STATE_PENDING, value);
        }
        return new ParsedState(value.substring(0, idx), value.substring(idx + 1));
    }

    private record ParsedState(String state, String fingerprint) {
    }
}

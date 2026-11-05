package com.serhat.secondhand.auth.application;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

/**
 * Login throttling, shared by all instances through Redis.
 *
 * <p>Failures are counted per account and client IP, so an attacker can only lock their own IP out of an
 * account, never the real owner on another IP. A second counter per IP across all accounts stops one
 * client from trying many accounts. Each counter expires {@link #WINDOW} after its first failure.
 */
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    static final int MAX_FAILURES_PER_ACCOUNT_AND_IP = 5;
    static final int MAX_FAILURES_PER_IP = 20;
    static final Duration WINDOW = Duration.ofMinutes(15);
    static final String ACCOUNT_KEY_PREFIX = "auth:login-fail:account:";
    static final String IP_KEY_PREFIX = "auth:login-fail:ip:";

    private final StringRedisTemplate redisTemplate;

    public boolean isBlocked(String email, String clientIp) {
        List<String> counts = redisTemplate.opsForValue().multiGet(List.of(accountKey(email, clientIp), ipKey(clientIp)));
        if (counts == null) {
            return false;
        }
        return atLeast(counts.get(0), MAX_FAILURES_PER_ACCOUNT_AND_IP) || atLeast(counts.get(1), MAX_FAILURES_PER_IP);
    }

    public void loginFailed(String email, String clientIp) {
        increment(accountKey(email, clientIp));
        increment(ipKey(clientIp));
    }

    /** Clears only this account's counter; the IP counter stays, so one valid login cannot reset it. */
    public void loginSucceeded(String email, String clientIp) {
        redisTemplate.delete(accountKey(email, clientIp));
    }

    // SET NX with the TTL first, then INCR (which keeps the TTL): a counter never lives without an expiry.
    private void increment(String key) {
        redisTemplate.opsForValue().setIfAbsent(key, "0", WINDOW);
        redisTemplate.opsForValue().increment(key);
    }

    private static boolean atLeast(String value, int limit) {
        return value != null && Long.parseLong(value) >= limit;
    }

    // Case/whitespace variants of the same account share one counter.
    private static String accountKey(String email, String clientIp) {
        String normalized = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        return ACCOUNT_KEY_PREFIX + normalized + ":" + ip(clientIp);
    }

    private static String ipKey(String clientIp) {
        return IP_KEY_PREFIX + ip(clientIp);
    }

    private static String ip(String clientIp) {
        return clientIp == null || clientIp.isBlank() ? "unknown" : clientIp;
    }
}

package com.serhat.secondhand.auth.application;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPT = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    // Bounded and self-expiring: entries disappear LOCK_DURATION after the last failure
    private final Cache<String, Integer> attempts = Caffeine.newBuilder()
            .maximumSize(100_000)
            .expireAfterWrite(LOCK_DURATION)
            .build();

    public void loginSucceeded(String key) {
        String k = normalize(key);
        if (k != null) attempts.invalidate(k);
    }

    public void loginFailed(String key) {
        String k = normalize(key);
        if (k != null) attempts.asMap().merge(k, 1, Integer::sum);
    }

    public boolean isBlocked(String key) {
        String k = normalize(key);
        Integer count = k == null ? null : attempts.getIfPresent(k);
        return count != null && count >= MAX_ATTEMPT;
    }

    // Case/whitespace variants of the same account must share one counter
    private static String normalize(String key) {
        return key == null ? null : key.trim().toLowerCase(Locale.ROOT);
    }
}

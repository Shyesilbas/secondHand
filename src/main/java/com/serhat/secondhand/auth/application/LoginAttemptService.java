package com.serhat.secondhand.auth.application;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int MAX_ATTEMPT = 5;
    private final int LOCK_TIME_DURATION_MINUTES = 15;
    
    private final Map<String, LoginAttempt> attemptsCache = new ConcurrentHashMap<>();

    private static class LoginAttempt {
        int attempts;
        LocalDateTime lastAttempt;

        LoginAttempt(int attempts, LocalDateTime lastAttempt) {
            this.attempts = attempts;
            this.lastAttempt = lastAttempt;
        }
    }

    public void loginSucceeded(String key) {
        if (key != null) {
            attemptsCache.remove(key);
        }
    }

    public void loginFailed(String key) {
        if (key == null) return;
        
        LoginAttempt attempt = attemptsCache.getOrDefault(key, new LoginAttempt(0, LocalDateTime.now()));
        attempt.attempts++;
        attempt.lastAttempt = LocalDateTime.now();
        
        attemptsCache.put(key, attempt);
    }

    public boolean isBlocked(String key) {
        if (key == null || !attemptsCache.containsKey(key)) {
            return false;
        }
        
        LoginAttempt attempt = attemptsCache.get(key);
        if (attempt.attempts >= MAX_ATTEMPT) {
            if (attempt.lastAttempt.plusMinutes(LOCK_TIME_DURATION_MINUTES).isAfter(LocalDateTime.now())) {
                return true;
            } else {
                attemptsCache.remove(key);
                return false;
            }
        }
        return false;
    }
}

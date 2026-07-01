package com.serhat.secondhand.email.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RateLimitedEmailSender {

    private final double tokensPerSecond = 10.0; // max 10 emails per second
    private final double maxTokens = 10.0;
    private double tokens = 10.0;
    private long lastRefillTimestamp = System.nanoTime();

    public synchronized void acquire() {
        while (true) {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return;
            }
            long sleepTimeMs = (long) ((1.0 - tokens) / tokensPerSecond * 1000.0);
            if (sleepTimeMs <= 0) {
                sleepTimeMs = 1;
            }
            try {
                Thread.sleep(sleepTimeMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Thread interrupted while acquiring rate limit token", e);
            }
        }
    }

    private void refill() {
        long now = System.nanoTime();
        double deltaSeconds = (now - lastRefillTimestamp) / 1e9;
        if (deltaSeconds > 0) {
            tokens = Math.min(maxTokens, tokens + deltaSeconds * tokensPerSecond);
            lastRefillTimestamp = now;
        }
    }
}

package com.serhat.secondhand.ai.agent.search;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Kullanıcı başına canlı ilan araması hız sınırı (varsayılan: dakikada 12).
 */
@Component
public class AuraAgentSearchRateLimiter {

    private final ConcurrentHashMap<Long, Deque<Long>> windows = new ConcurrentHashMap<>();

    @Value("${aura.agent.search.rate-limit-per-minute:12}")
    private int maxPerMinute;

    @Value("${aura.agent.search.rate-limit-window-ms:60000}")
    private long windowMs;

    public boolean tryAcquire(Long userId) {
        if (userId == null) {
            return false;
        }
        long now = System.currentTimeMillis();
        Deque<Long> dq = windows.computeIfAbsent(userId, k -> new ArrayDeque<>());
        synchronized (dq) {
            while (!dq.isEmpty() && now - dq.peekFirst() > windowMs) {
                dq.pollFirst();
            }
            if (dq.size() >= maxPerMinute) {
                return false;
            }
            dq.addLast(now);
            return true;
        }
    }
}

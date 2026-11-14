package com.serhat.secondhand.complaint.queue;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

/**
 * Delayed review queue: a Redis sorted set of complaint ids scored by the epoch second at which
 * each becomes eligible for review. PostgreSQL stays the source of truth
 * ({@link ComplaintQueueRecovery} rebuilds this set from {@code PENDING} rows).
 */
@Component
@RequiredArgsConstructor
public class ComplaintReviewQueue {

    public static final String QUEUE_KEY = "v4:complaints:delayed_queue";
    /** Appeals waiting for Aura's second look, scored by submission time (no cooling-off). */
    public static final String APPEAL_QUEUE_KEY = "v4:complaints:appeal_queue";

    private final StringRedisTemplate redisTemplate;

    /** Adds or moves the complaint to {@code eligibleAt}. */
    public void schedule(String complaintId, LocalDateTime eligibleAt) {
        redisTemplate.opsForZSet().add(QUEUE_KEY, complaintId, score(eligibleAt));
    }

    /** Adds the complaint only if it is not queued yet, so an existing retry delay is kept. */
    public boolean scheduleIfAbsent(String complaintId, LocalDateTime eligibleAt) {
        Boolean added = redisTemplate.opsForZSet().addIfAbsent(QUEUE_KEY, complaintId, score(eligibleAt));
        return Boolean.TRUE.equals(added);
    }

    /** Oldest complaints whose eligibility time is at or before {@code now}, at most {@code limit}. */
    public List<String> due(LocalDateTime now, int limit) {
        Set<String> ids = redisTemplate.opsForZSet().rangeByScore(QUEUE_KEY, 0, score(now), 0, limit);
        return ids == null ? List.of() : List.copyOf(ids);
    }

    public void remove(String complaintId) {
        redisTemplate.opsForZSet().remove(QUEUE_KEY, complaintId);
    }

    public void scheduleAppeal(String complaintId, LocalDateTime eligibleAt) {
        redisTemplate.opsForZSet().add(APPEAL_QUEUE_KEY, complaintId, score(eligibleAt));
    }

    public boolean scheduleAppealIfAbsent(String complaintId, LocalDateTime eligibleAt) {
        Boolean added = redisTemplate.opsForZSet().addIfAbsent(APPEAL_QUEUE_KEY, complaintId, score(eligibleAt));
        return Boolean.TRUE.equals(added);
    }

    public List<String> dueAppeals(LocalDateTime now, int limit) {
        Set<String> ids = redisTemplate.opsForZSet().rangeByScore(APPEAL_QUEUE_KEY, 0, score(now), 0, limit);
        return ids == null ? List.of() : List.copyOf(ids);
    }

    public void removeAppeal(String complaintId) {
        redisTemplate.opsForZSet().remove(APPEAL_QUEUE_KEY, complaintId);
    }

    static double score(LocalDateTime time) {
        return time.atZone(ZoneId.systemDefault()).toEpochSecond();
    }
}

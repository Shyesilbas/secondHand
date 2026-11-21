package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.core.redis.ExpiringCounter;
import com.serhat.secondhand.review.application.event.ReviewCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Keeps {@code ai:summaries} fresh without paying a Gemini call per review. After a review commits, the seller's
 * and the listing's cached summary is dropped only when
 * <ul>
 *   <li>it is the "no reviews yet" placeholder (the first review must show up), or</li>
 *   <li>{@code ai.summary.refresh-after-new-reviews} reviews arrived since it was cached.</li>
 * </ul>
 * Otherwise the old summary stays until enough reviews pile up or {@link AiSummaryService#CACHE_TTL} ends.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiSummaryCacheInvalidationListener {

    static final String NEW_REVIEWS_KEY_PREFIX = "v4:ai:summary:new_reviews:";

    private final CacheManager cacheManager;
    private final ExpiringCounter expiringCounter;
    private final StringRedisTemplate redisTemplate;

    @Value("${ai.summary.refresh-after-new-reviews:5}")
    private int refreshAfterNewReviews = 5;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReviewCreated(ReviewCreatedEvent event) {
        Cache cache = cacheManager.getCache(AiSummaryService.CACHE_NAME);
        if (cache == null) {
            throw new IllegalStateException("Cache not registered: " + AiSummaryService.CACHE_NAME);
        }
        try {
            if (event.reviewedUserId() != null) {
                refreshIfStale(cache, AiSummaryService.userSummaryKey(event.reviewedUserId()));
            }
            if (event.listingId() != null) {
                refreshIfStale(cache, AiSummaryService.listingSummaryKey(event.listingId()));
            }
        } catch (RuntimeException e) {
            // The review is already committed; a stale summary only lasts until the cache TTL.
            log.warn("Could not refresh AI review summaries after review {}: {}", event.reviewId(), e.getMessage());
        }
    }

    private void refreshIfStale(Cache cache, String summaryKey) {
        String counterKey = NEW_REVIEWS_KEY_PREFIX + summaryKey;
        Cache.ValueWrapper cached = cache.get(summaryKey);
        if (cached == null) {
            // Nothing cached: the next read summarizes every review, so start counting from zero.
            redisTemplate.delete(counterKey);
            return;
        }
        if (AiSummaryService.isNoReviewsPlaceholder(cached.get())
                || expiringCounter.increment(counterKey, AiSummaryService.CACHE_TTL) >= refreshAfterNewReviews) {
            cache.evict(summaryKey);
            redisTemplate.delete(counterKey);
        }
    }
}

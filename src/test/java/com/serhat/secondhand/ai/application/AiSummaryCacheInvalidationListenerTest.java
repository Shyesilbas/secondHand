package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.core.redis.ExpiringCounter;
import com.serhat.secondhand.review.application.event.ReviewCreatedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AiSummaryCacheInvalidationListenerTest {

    private final ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(AiSummaryService.CACHE_NAME);
    private final Cache cache = cacheManager.getCache(AiSummaryService.CACHE_NAME);
    private final ExpiringCounter counter = mock(ExpiringCounter.class);
    private final StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
    private final AiSummaryCacheInvalidationListener listener =
            new AiSummaryCacheInvalidationListener(cacheManager, counter, redisTemplate);
    private final Map<String, Long> counts = new HashMap<>();

    private final UUID listingId = UUID.randomUUID();
    private final String sellerKey = AiSummaryService.userSummaryKey(2L);
    private final String listingKey = AiSummaryService.listingSummaryKey(listingId);

    @BeforeEach
    void fakeCounter() {
        when(counter.increment(anyString(), eq(AiSummaryService.CACHE_TTL)))
                .thenAnswer(inv -> counts.merge(inv.getArgument(0), 1L, Long::sum));
        when(redisTemplate.delete(anyString())).thenAnswer(inv -> counts.remove(inv.<String>getArgument(0)) != null);
    }

    private void review() {
        listener.onReviewCreated(new ReviewCreatedEvent(1, 2L, listingId));
    }

    @Test
    void generatedSummary_staysUntilEnoughNewReviewsArrive() {
        cache.put(sellerKey, "seller summary");
        cache.put(listingKey, "listing summary");

        for (int i = 0; i < 4; i++) review();
        // Four reviews: no Gemini call yet, the old summary is still served.
        assertThat(cache.get(sellerKey).get()).isEqualTo("seller summary");
        assertThat(cache.get(listingKey).get()).isEqualTo("listing summary");

        review();
        assertThat(cache.get(sellerKey)).isNull();
        assertThat(cache.get(listingKey)).isNull();
        assertThat(counts).isEmpty();
    }

    @Test
    void firstReview_replacesTheNoReviewsPlaceholderAtOnce() {
        cache.put(sellerKey, AiSummaryService.USER_NO_REVIEWS_MESSAGE);
        cache.put(listingKey, AiSummaryService.LISTING_NO_REVIEWS_MESSAGE);

        review();

        assertThat(cache.get(sellerKey)).isNull();
        assertThat(cache.get(listingKey)).isNull();
        verify(counter, never()).increment(anyString(), any());
    }

    @Test
    void nothingCached_resetsTheCounterSoTheNextSummaryStartsFresh() {
        counts.put(AiSummaryCacheInvalidationListener.NEW_REVIEWS_KEY_PREFIX + sellerKey, 3L);

        review();

        assertThat(counts).isEmpty();
        verify(counter, never()).increment(anyString(), any());
    }

    @Test
    void otherUsersSummariesAreUntouched() {
        cache.put(AiSummaryService.userSummaryKey(9L), AiSummaryService.USER_NO_REVIEWS_MESSAGE);

        review();

        assertThat(cache.get(AiSummaryService.userSummaryKey(9L)).get()).isEqualTo(AiSummaryService.USER_NO_REVIEWS_MESSAGE);
    }

    @Test
    void redisFailure_doesNotFailTheCommittedReview() {
        cache.put(sellerKey, "seller summary");
        when(counter.increment(anyString(), any())).thenThrow(new IllegalStateException("redis down"));

        review();

        assertThat(cache.get(sellerKey).get()).isEqualTo("seller summary");
    }

    @Test
    void summaryKeysMatchTheFormatAlreadyInRedis() {
        UUID id = UUID.fromString("00000000-0000-0000-0000-000000000001");
        assertThat(AiSummaryService.userSummaryKey(2L)).isEqualTo("user:2");
        assertThat(AiSummaryService.listingSummaryKey(id)).isEqualTo("listing:" + id);
    }
}

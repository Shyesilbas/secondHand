package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.domain.repository.listing.ListingViewRepository;
import com.serhat.secondhand.user.application.IUserService;
import org.junit.jupiter.api.Test;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.ZSetOperations;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** View statistics cache keys and view tracking identity and ordering. */
class ListingViewServiceTest {

    private final ListingViewRepository viewRepository = mock(ListingViewRepository.class);
    private final ListingRepository listingRepository = mock(ListingRepository.class);
    private final IUserService userService = mock(IUserService.class);
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    @SuppressWarnings("unchecked")
    private final ZSetOperations<String, String> zset = mock(ZSetOperations.class);
    private final ListingViewService service = new ListingViewService(viewRepository, listingRepository, userService, redis);

    private final UUID listingId = UUID.randomUUID();

    private void givenRedis(boolean isNew) {
        when(redis.opsForValue()).thenReturn(values);
        when(redis.opsForZSet()).thenReturn(zset);
        when(values.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(isNew);
        when(listingRepository.findSellerIdById(listingId)).thenReturn(Optional.of(99L));
    }

    @Test
    void anonymousViewerIsIdentifiedByIpNotByClientSessionId() {
        givenRedis(true);

        service.trackView(listingId, null, "session-1", "10.0.0.1", "ua");
        service.trackView(listingId, null, "session-2", "10.0.0.1", "ua");

        verify(values, times(2)).setIfAbsent(argThat(k -> k.startsWith("v4:listing:view:dedup:ip:") && !k.contains("session")),
                eq("1"), any(Duration.class));
    }

    @Test
    void duplicateViewSkipsListingAndUserLoads() {
        givenRedis(false);

        service.trackView(listingId, 5L, null, "10.0.0.1", "ua");

        verify(listingRepository, never()).findById(any());
        verifyNoInteractions(userService, viewRepository);
    }

    @Test
    void ownerViewIsSkippedBeforeAnyRedisCall() {
        givenRedis(true);

        service.trackView(listingId, 99L, null, "10.0.0.1", "ua");

        verify(redis, never()).opsForValue();
        verify(redis, never()).opsForZSet();
        verifyNoInteractions(viewRepository);
    }

    @Test
    void viewerWithoutUserOrIpIsNotTracked() {
        assertThat(ListingViewService.viewerIdentifier(null, "")).isNull();
        assertThat(ListingViewService.viewerIdentifier(3L, "")).isEqualTo("u:3");
    }

    @Test
    void statisticsCacheKeysCarryRequesterAndDateRange() throws Exception {
        String listingKey = ListingViewService.class.getMethod("getViewStatisticsForOwner",
                UUID.class, Long.class, LocalDateTime.class, LocalDateTime.class).getAnnotation(Cacheable.class).key();
        String sellerKey = ListingViewService.class.getMethod("getAggregatedViewStatisticsForSeller",
                Long.class, LocalDateTime.class, LocalDateTime.class).getAnnotation(Cacheable.class).key();

        assertThat(listingKey).contains("#requesterId", "#startDate", "#endDate");
        assertThat(sellerKey).contains("#sellerId", "#startDate", "#endDate");
    }
}

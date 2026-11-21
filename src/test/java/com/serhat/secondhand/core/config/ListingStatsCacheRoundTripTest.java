package com.serhat.secondhand.core.config;

import com.serhat.secondhand.favorite.application.FavoriteStatsService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.notification.application.INotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.review.application.ReviewService;
import com.serhat.secondhand.review.dto.ReviewStatsDto;
import com.serhat.secondhand.review.mapper.ReviewMapper;
import com.serhat.secondhand.review.repository.ReviewRepository;
import com.serhat.secondhand.review.repository.projection.ListingReviewStatsProjection;
import com.serhat.secondhand.review.validator.ReviewValidator;
import com.serhat.secondhand.user.application.IUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Listing cards read review and favorite stats with {@code map.get(listingId)}. These maps are cached in Redis,
 * so the lookup must still work after a trip through the cache serializer (a cache hit), not only on a miss.
 */
@ExtendWith(MockitoExtension.class)
class ListingStatsCacheRoundTripTest {

    private final GenericJackson2JsonRedisSerializer cacheSerializer =
            new GenericJackson2JsonRedisSerializer(new CacheConfig().buildCacheObjectMapper());

    @Mock private ReviewRepository reviewRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private IUserService userService;
    @Mock private ReviewMapper reviewMapper;
    @Mock private ListingRepository listingRepository;
    @Mock private ReviewValidator reviewValidator;
    @Mock private INotificationService notificationService;
    @Mock private NotificationTemplateCatalog notificationTemplateCatalog;
    @Mock private ApplicationEventPublisher eventPublisher;
    @InjectMocks private ReviewService reviewService;

    @Mock private FavoriteRepository favoriteRepository;

    @SuppressWarnings("unchecked")
    private <K, V> Map<K, V> cacheHit(Map<K, V> value) {
        return (Map<K, V>) cacheSerializer.deserialize(cacheSerializer.serialize(value));
    }

    @Test
    void reviewStatsKeepUuidKeysAfterACacheHit() {
        UUID listingId = UUID.randomUUID();
        ListingReviewStatsProjection row = mock(ListingReviewStatsProjection.class);
        when(row.getListingId()).thenReturn(listingId);
        when(reviewRepository.getListingReviewStats(List.of(listingId))).thenReturn(List.of(row));
        ReviewStatsDto stats = new ReviewStatsDto(8L, 4.875, 7L, 1L, 0L, 0L, 0L, 0L);
        when(reviewMapper.mapToReviewStatsDto(row)).thenReturn(stats);

        Map<UUID, ReviewStatsDto> fromCache = cacheHit(reviewService.getListingReviewStatsDto(List.of(listingId)));

        assertThat(fromCache.get(listingId)).isNotNull();
        assertThat(fromCache.get(listingId).getTotalReviews()).isEqualTo(8L);
        assertThat(fromCache.get(listingId).getAverageRating()).isEqualTo(4.875);
    }

    @Test
    void favoriteStatsKeepUuidKeysAfterACacheHit() {
        UUID listingId = UUID.randomUUID();
        when(favoriteRepository.countByListingIds(List.of(listingId)))
                .thenReturn(List.<Object[]>of(new Object[]{listingId, 3L}));
        when(favoriteRepository.findListingIdsByUserIdAndListingIdIn(5L, List.of(listingId))).thenReturn(List.of(listingId));
        FavoriteStatsService favoriteStatsService = new FavoriteStatsService(favoriteRepository);

        Map<UUID, FavoriteStatsDto> fromCache =
                cacheHit(favoriteStatsService.getFavoriteStatsForListings(List.of(listingId), 5L));

        assertThat(fromCache.get(listingId)).isNotNull();
        assertThat(fromCache.get(listingId).getFavoriteCount()).isEqualTo(3L);
    }
}

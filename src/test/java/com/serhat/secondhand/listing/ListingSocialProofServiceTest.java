package com.serhat.secondhand.listing;

import com.serhat.secondhand.cart.application.CartSocialMetricService;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.application.common.ListingSocialProofService;
import com.serhat.secondhand.listing.application.common.ListingViewService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingSocialProofDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListingSocialProofServiceTest {

    @Mock
    private ListingViewService listingViewService;

    @Mock
    private CartSocialMetricService cartSocialMetricService;

    @Mock
    private com.serhat.secondhand.favorite.application.FavoriteStatsService favoriteStatsService;

    @Mock
    private FavoriteRepository favoriteRepository;

    private ListingSocialProofService socialProofService;

    @BeforeEach
    void setUp() {
        socialProofService = new ListingSocialProofService(
                listingViewService,
                cartSocialMetricService,
                favoriteStatsService,
                favoriteRepository
        );
    }

    @Test
    void getSocialProof_shouldAggregateViewsCartAndFavoriteCounts() {
        UUID listingId = UUID.randomUUID();

        when(listingViewService.getActiveViewerCount(listingId)).thenReturn(18);
        when(cartSocialMetricService.getInCartCount(listingId)).thenReturn(4);
        when(favoriteStatsService.getFavoriteStats(listingId, null)).thenReturn(
                com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto.builder()
                        .listingId(listingId)
                        .favoriteCount(12L)
                        .build()
        );

        ListingSocialProofDto result = socialProofService.getSocialProof(listingId);

        assertNotNull(result);
        assertEquals(18, result.getViewsLast24Hours());
        assertEquals(4, result.getInCartCount());
        assertEquals(12L, result.getFavoriteCount());

        verify(listingViewService).getActiveViewerCount(listingId);
        verify(cartSocialMetricService).getInCartCount(listingId);
        verify(favoriteStatsService).getFavoriteStats(listingId, null);
    }

    @Test
    void getSocialProof_withNullListingId_shouldReturnZeroedDto() {
        ListingSocialProofDto result = socialProofService.getSocialProof(null);

        assertNotNull(result);
        assertEquals(0, result.getViewsLast24Hours());
        assertEquals(0, result.getInCartCount());
        assertEquals(0L, result.getFavoriteCount());
    }

    @Test
    void enrichWithSocialProofBatch_usesPipelinedViewerCountsAndSkipsDuplicateFavoriteQuery() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        var dto1 = new com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto() {};
        dto1.setId(id1);
        dto1.setFavoriteStats(com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto.builder()
                .listingId(id1).favoriteCount(7L).build());
        var dto2 = new com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto() {};
        dto2.setId(id2);
        dto2.setFavoriteStats(com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto.builder()
                .listingId(id2).favoriteCount(3L).build());

        when(cartSocialMetricService.getInCartCounts(java.util.List.of(id1, id2)))
                .thenReturn(java.util.Map.of(id1, 2, id2, 5));
        when(listingViewService.getActiveViewerCounts(java.util.List.of(id1, id2)))
                .thenReturn(java.util.Map.of(id1, 11, id2, 4));

        socialProofService.enrichWithSocialProof(java.util.List.of(dto1, dto2));

        assertEquals(11, dto1.getSocialProof().getViewsLast24Hours());
        assertEquals(2, dto1.getSocialProof().getInCartCount());
        assertEquals(7L, dto1.getSocialProof().getFavoriteCount());
        assertEquals(4, dto2.getSocialProof().getViewsLast24Hours());
        assertEquals(5, dto2.getSocialProof().getInCartCount());
        assertEquals(3L, dto2.getSocialProof().getFavoriteCount());

        verify(listingViewService).getActiveViewerCounts(java.util.List.of(id1, id2));
        verify(listingViewService, org.mockito.Mockito.never()).getActiveViewerCount(org.mockito.ArgumentMatchers.any());
        verify(favoriteRepository, org.mockito.Mockito.never()).countByListingIds(org.mockito.ArgumentMatchers.any());
    }
}

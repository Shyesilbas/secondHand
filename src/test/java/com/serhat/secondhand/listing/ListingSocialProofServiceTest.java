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
}

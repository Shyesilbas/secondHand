package com.serhat.secondhand.listing.application.query;

import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.application.port.ListingSalesRankingPort;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.BestSellerRanking;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListingBestSellerServiceTest {

    @Mock
    private ListingSalesRankingService salesRankingService;

    @Mock
    private ListingQueryService listingQueryService;

    @InjectMocks
    private ListingBestSellerService service;

    private static ListingDto listing(UUID id, ListingStatus status) {
        BooksListingDto dto = new BooksListingDto();
        dto.setId(id);
        dto.setStatus(status);
        return dto;
    }

    @Test
    void keepsSalesOrderEvenWhenLookupReturnsAnotherOrder() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();
        UUID third = UUID.randomUUID();
        List<UUID> ranking = List.of(first, second, third);
        when(salesRankingService.getBestSellerRanking()).thenReturn(new BestSellerRanking(ranking));
        when(listingQueryService.findByIds(ranking, 7L)).thenReturn(List.of(
                listing(third, ListingStatus.ACTIVE),
                listing(first, ListingStatus.ACTIVE),
                listing(second, ListingStatus.ACTIVE)));

        List<ListingDto> result = service.getBestSellers(10, 7L);

        assertThat(result).extracting(ListingDto::getId).containsExactly(first, second, third);
    }

    @Test
    void dropsListingsThatLeftActiveOrAreHiddenFromTheViewer() {
        UUID sold = UUID.randomUUID();
        UUID hidden = UUID.randomUUID();
        UUID active = UUID.randomUUID();
        List<UUID> ranking = List.of(sold, hidden, active);
        when(salesRankingService.getBestSellerRanking()).thenReturn(new BestSellerRanking(ranking));
        // "hidden" is missing from the lookup, as findByIds does for blocked sellers.
        when(listingQueryService.findByIds(ranking, null)).thenReturn(List.of(
                listing(sold, ListingStatus.SOLD),
                listing(active, ListingStatus.ACTIVE)));

        List<ListingDto> result = service.getBestSellers(null, null);

        assertThat(result).extracting(ListingDto::getId).containsExactly(active);
    }

    @Test
    void stopsAtTheRequestedLimit() {
        List<UUID> ranking = IntStream.range(0, 5).mapToObj(i -> UUID.randomUUID()).toList();
        when(salesRankingService.getBestSellerRanking()).thenReturn(new BestSellerRanking(ranking));
        when(listingQueryService.findByIds(ranking, 1L)).thenReturn(
                ranking.stream().map(id -> listing(id, ListingStatus.ACTIVE)).toList());

        List<ListingDto> result = service.getBestSellers(2, 1L);

        assertThat(result).extracting(ListingDto::getId).containsExactly(ranking.get(0), ranking.get(1));
    }

    @Test
    void emptyRankingSkipsTheListingLookup() {
        when(salesRankingService.getBestSellerRanking()).thenReturn(new BestSellerRanking(List.of()));

        assertThat(service.getBestSellers(10, 1L)).isEmpty();
        verify(listingQueryService, never()).findByIds(any(), anyLong());
    }

    @Test
    void clampsTheLimit() {
        assertThat(ListingBestSellerService.clampLimit(null)).isEqualTo(ListingBusinessConstants.DEFAULT_BEST_SELLER_LIMIT);
        assertThat(ListingBestSellerService.clampLimit(0)).isEqualTo(1);
        assertThat(ListingBestSellerService.clampLimit(500)).isEqualTo(ListingBusinessConstants.MAX_BEST_SELLER_LIMIT);
    }

    @Test
    void rankingServiceAsksThePortForTheWholePool() {
        ListingSalesRankingPort port = org.mockito.Mockito.mock(ListingSalesRankingPort.class);
        UUID id = UUID.randomUUID();
        when(port.findTopSellingActiveListingIds(ListingBusinessConstants.BEST_SELLER_POOL_SIZE)).thenReturn(List.of(id));

        BestSellerRanking ranking = new ListingSalesRankingService(port).getBestSellerRanking();

        assertThat(ranking.listingIds()).containsExactly(id);
    }
}

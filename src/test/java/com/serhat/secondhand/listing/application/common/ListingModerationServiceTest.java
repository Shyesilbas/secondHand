package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ListingModerationServiceTest {

    private final ListingRepository repository = mock(ListingRepository.class);
    private final ListingModerationService service = new ListingModerationService(repository);

    private static Listing listing(ListingStatus status) {
        Listing listing = mock(Listing.class);
        when(listing.getStatus()).thenReturn(status);
        return listing;
    }

    @Test
    void suspendDeactivatesAnActiveListing() {
        UUID id = UUID.randomUUID();
        Listing active = listing(ListingStatus.ACTIVE);
        when(repository.findById(id)).thenReturn(Optional.of(active));

        assertThat(service.suspend(id)).isTrue();
        verify(active).deactivate();
        verify(repository).save(active);
    }

    @Test
    void suspendLeavesNonActiveListingsAlone() {
        UUID id = UUID.randomUUID();
        Listing sold = listing(ListingStatus.SOLD);
        when(repository.findById(id)).thenReturn(Optional.of(sold));

        assertThat(service.suspend(id)).isFalse();
        verify(sold, never()).deactivate();
    }

    @Test
    void suspendAllKeepsTakingTheFirstPageUntilNoActiveListingIsLeft() {
        Listing a = listing(ListingStatus.ACTIVE);
        Listing b = listing(ListingStatus.ACTIVE);
        PageRequest first = PageRequest.of(0, ListingModerationService.PAGE_SIZE);
        when(repository.findBySellerIdAndStatus(eq(7L), eq(ListingStatus.ACTIVE), eq(first)))
                .thenReturn(new PageImpl<>(List.of(a), first, 2))
                .thenReturn(new PageImpl<>(List.of(b), first, 1))
                .thenReturn(new PageImpl<>(List.of(), first, 0));

        assertThat(service.suspendAllActive(7L)).isEqualTo(2);
        verify(a).deactivate();
        verify(b).deactivate();
        verify(repository, times(3)).findBySellerIdAndStatus(7L, ListingStatus.ACTIVE, first);
    }

    @Test
    void listingsThatNeverLeaveActiveStopTheLoopWithAnError() {
        PageRequest first = PageRequest.of(0, ListingModerationService.PAGE_SIZE);
        Listing stuck = listing(ListingStatus.ACTIVE);
        when(repository.findBySellerIdAndStatus(eq(7L), eq(ListingStatus.ACTIVE), eq(first)))
                .thenReturn(new PageImpl<>(List.of(stuck), first, 1));

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.suspendAllActive(7L))
                .isInstanceOf(IllegalStateException.class);
    }
}

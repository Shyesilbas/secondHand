package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.review.application.IReviewService;
import com.serhat.secondhand.user.application.UserBlockService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListingQueryServiceBulkAndVisibilityTest {

    @Mock
    private ListingRepository listingRepository;
    @Mock
    private ListingMapper listingMapper;
    @Mock
    private ListingEnrichmentService enrichmentService;
    @Mock
    private ListingViewService listingViewService;
    @Mock
    private IReviewService reviewService;
    @Mock
    private ListingQueryService self;
    @Mock
    private UserBlockService userBlockService;

    private ListingQueryService service;

    @BeforeEach
    void setUp() {
        service = new ListingQueryService(
                listingRepository,
                listingMapper,
                enrichmentService,
                listingViewService,
                reviewService,
                Runnable::run,
                self,
                userBlockService);
        lenient().when(enrichmentService.enrich(anyList(), any())).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(reviewService.getReviewsForListing(any(), any())).thenReturn(Result.success(Page.empty()));
    }

    @Test
    void findByIdsRejectsRequestsExceedingMaxBulkLimit() {
        List<UUID> oversized = new ArrayList<>();
        for (int i = 0; i <= ListingBusinessConstants.MAX_BULK_LISTING_IDS; i++) {
            oversized.add(UUID.randomUUID());
        }

        assertThatThrownBy(() -> service.findByIds(oversized, 10L))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ListingErrorCodes.BULK_LISTING_LIMIT_EXCEEDED.getMessage());

        verifyNoInteractions(listingRepository);
    }

    @Test
    void findByIdsHidesDraftInactiveReservedDeletedAndBlockedListingsFromNonOwners() {
        Long viewerId = 99L;
        Listing active = listing(1L, ListingStatus.ACTIVE);
        Listing sold = listing(2L, ListingStatus.SOLD);
        Listing draft = listing(3L, ListingStatus.DRAFT);
        Listing inactive = listing(4L, ListingStatus.INACTIVE);
        Listing reserved = listing(5L, ListingStatus.RESERVED);
        Listing deleted = listing(6L, ListingStatus.DELETED);
        Listing blockedActive = listing(7L, ListingStatus.ACTIVE);

        when(userBlockService.isBlockedEitherWay(viewerId, 1L)).thenReturn(false);
        when(userBlockService.isBlockedEitherWay(viewerId, 2L)).thenReturn(false);
        when(userBlockService.isBlockedEitherWay(viewerId, 7L)).thenReturn(true);

        List<UUID> requested = List.of(
                active.getId(), sold.getId(), draft.getId(), inactive.getId(),
                reserved.getId(), deleted.getId(), blockedActive.getId(), active.getId());

        when(listingRepository.findAllByIdIn(anyList())).thenReturn(List.of(
                active, sold, draft, inactive, reserved, deleted, blockedActive));
        stubDynamicDto(active);
        stubDynamicDto(sold);

        List<ListingDto> result = service.findByIds(requested, viewerId);

        assertThat(result).extracting(ListingDto::getId)
                .containsExactlyInAnyOrder(active.getId(), sold.getId());
        verify(listingRepository).findAllByIdIn(List.of(
                active.getId(), sold.getId(), draft.getId(), inactive.getId(),
                reserved.getId(), deleted.getId(), blockedActive.getId()));
    }

    @Test
    void findByIdsAllowsOwnerToReadOwnDraftAndInactiveListingsExceptDeleted() {
        Long ownerId = 42L;
        Listing ownDraft = listing(ownerId, ListingStatus.DRAFT);
        Listing ownInactive = listing(ownerId, ListingStatus.INACTIVE);
        Listing ownDeleted = listing(ownerId, ListingStatus.DELETED);
        Listing otherDraft = listing(100L, ListingStatus.DRAFT);

        when(listingRepository.findAllByIdIn(anyList()))
                .thenReturn(List.of(ownDraft, ownInactive, ownDeleted, otherDraft));
        stubDynamicDto(ownDraft);
        stubDynamicDto(ownInactive);

        List<ListingDto> result = service.findByIds(
                List.of(ownDraft.getId(), ownInactive.getId(), ownDeleted.getId(), otherDraft.getId()),
                ownerId);

        assertThat(result).extracting(ListingDto::getId)
                .containsExactlyInAnyOrder(ownDraft.getId(), ownInactive.getId());
    }

    @Test
    void findByIdAsDtoHidesDraftFromAnonymousAndOtherUsersButAllowsOwner() {
        Listing draft = listing(15L, ListingStatus.DRAFT);
        when(listingRepository.findByIdWithSeller(draft.getId())).thenReturn(Optional.of(draft));
        stubDynamicDto(draft);

        assertThat(service.findByIdAsDto(draft.getId(), null, null)).isEmpty();
        assertThat(service.findByIdAsDto(draft.getId(), 88L, 88L)).isEmpty();
        assertThat(service.findByIdAsDto(draft.getId(), 15L, 15L)).isPresent();
    }

    @Test
    void findByListingNoAsDtoHidesInactiveFromNonOwner() {
        Listing inactive = listing(15L, ListingStatus.INACTIVE);
        inactive.setListingNo("ABC12345");
        when(listingRepository.findByListingNoWithSeller("ABC12345")).thenReturn(Optional.of(inactive));
        stubDynamicDto(inactive);

        assertThat(service.findByListingNoAsDto("ABC12345", 88L, 88L)).isEmpty();
        assertThat(service.findByListingNoAsDto("ABC12345", 15L, 15L)).isPresent();
    }

    private Listing listing(Long sellerId, ListingStatus status) {
        User seller = new User();
        seller.setId(sellerId);
        return Listing.builder()
                .id(UUID.randomUUID())
                .seller(seller)
                .status(status)
                .listingType(ListingType.VEHICLE)
                .build();
    }

    private void stubDynamicDto(Listing listing) {
        ListingDto dto = new VehicleListingDto();
        dto.setId(listing.getId());
        dto.setSellerId(listing.getSeller().getId());
        dto.setType(listing.getListingType());
        lenient().when(listingMapper.toDynamicDto(eq(listing))).thenReturn(dto);
    }
}

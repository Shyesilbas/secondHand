package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.listing.domain.dto.request.ListingBatchStatusAction;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingBatchResult;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.user.application.UserRestrictionService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.RestrictedAction;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListingCommandServiceBatchStatusTest {

    private static final Long SELLER_ID = 7L;

    @Mock
    private ListingRepository listingRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private ListingValidationService listingValidationService;
    @Mock
    private ListingConfig listingConfig;
    @Mock
    private PriceHistoryService priceHistoryService;
    @Mock
    private EntityManager entityManager;
    @Mock
    private InventoryService inventoryService;
    @Mock
    private UserRestrictionService userRestrictionService;

    private ListingCommandService service;

    @BeforeEach
    void setUp() {
        service = new ListingCommandService(
                listingRepository,
                eventPublisher,
                listingValidationService,
                listingConfig,
                priceHistoryService,
                entityManager,
                inventoryService,
                userRestrictionService);
    }

    @Test
    void deactivatesEverySelectedListing() {
        Listing first = listing(ListingStatus.ACTIVE);
        Listing second = listing(ListingStatus.ACTIVE);
        List<UUID> ids = List.of(first.getId(), second.getId());
        when(listingRepository.countByIdInAndSellerId(ids, SELLER_ID)).thenReturn(2L);
        when(listingRepository.findAllByIdIn(ids)).thenReturn(List.of(first, second));

        Result<Void> result = service.updateBatchStatus(ids, ListingBatchStatusAction.DEACTIVATE, SELLER_ID);

        assertThat(result.isError()).isFalse();
        assertThat(first.getStatus()).isEqualTo(ListingStatus.INACTIVE);
        assertThat(second.getStatus()).isEqualTo(ListingStatus.INACTIVE);
        verify(listingRepository).saveAll(List.of(first, second));
    }

    @Test
    void duplicateIdsCountOnceForTheOwnershipCheck() {
        Listing only = listing(ListingStatus.INACTIVE);
        List<UUID> deduped = List.of(only.getId());
        when(userRestrictionService.check(SELLER_ID, RestrictedAction.CREATE_LISTING)).thenReturn(Result.success());
        when(listingRepository.countByIdInAndSellerId(deduped, SELLER_ID)).thenReturn(1L);
        when(listingRepository.findAllByIdIn(deduped)).thenReturn(List.of(only));

        Result<Void> result = service.updateBatchStatus(
                List.of(only.getId(), only.getId()), ListingBatchStatusAction.REACTIVATE, SELLER_ID);

        assertThat(result.isError()).isFalse();
        assertThat(only.getStatus()).isEqualTo(ListingStatus.ACTIVE);
    }

    @Test
    void rejectsTheWholeBatchWhenOneListingBelongsToSomeoneElse() {
        List<UUID> ids = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(listingRepository.countByIdInAndSellerId(ids, SELLER_ID)).thenReturn(1L);

        Result<Void> result = service.updateBatchStatus(ids, ListingBatchStatusAction.MARK_SOLD, SELLER_ID);

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(ListingErrorCodes.NOT_LISTING_OWNER.getCode());
        verify(listingRepository, never()).findAllByIdIn(anyList());
        verify(listingRepository, never()).saveAll(any());
    }

    @Test
    void failsWithoutSavingWhenOneListingCannotMakeTheTransition() {
        Listing active = listing(ListingStatus.ACTIVE);
        Listing inactive = listing(ListingStatus.INACTIVE);
        List<UUID> ids = List.of(active.getId(), inactive.getId());
        when(listingRepository.countByIdInAndSellerId(ids, SELLER_ID)).thenReturn(2L);
        when(listingRepository.findAllByIdIn(ids)).thenReturn(List.of(active, inactive));

        assertThatThrownBy(() -> service.updateBatchStatus(ids, ListingBatchStatusAction.DEACTIVATE, SELLER_ID))
                .isInstanceOf(BusinessException.class);

        verify(listingRepository, never()).saveAll(any());
    }

    @Test
    void restrictedSellerCannotReactivate() {
        List<UUID> ids = List.of(UUID.randomUUID());
        when(userRestrictionService.check(SELLER_ID, RestrictedAction.CREATE_LISTING))
                .thenReturn(Result.error("restricted", "USER_RESTRICTED"));

        Result<Void> result = service.updateBatchStatus(ids, ListingBatchStatusAction.REACTIVATE, SELLER_ID);

        assertThat(result.isError()).isTrue();
        verifyNoInteractions(listingRepository);
    }

    @Test
    void reactivatesEveryInactiveListingOfTheSeller() {
        Listing first = listing(ListingStatus.INACTIVE);
        Listing second = listing(ListingStatus.INACTIVE);
        when(userRestrictionService.check(SELLER_ID, RestrictedAction.CREATE_LISTING)).thenReturn(Result.success());
        when(listingRepository.findAllOwnedWithStatus(SELLER_ID, ListingStatus.INACTIVE)).thenReturn(List.of(first, second));

        Result<ListingBatchResult> result = service.reactivateAllInactive(SELLER_ID);

        assertThat(result.isError()).isFalse();
        assertThat(result.getData().updatedCount()).isEqualTo(2);
        assertThat(first.getStatus()).isEqualTo(ListingStatus.ACTIVE);
        assertThat(second.getStatus()).isEqualTo(ListingStatus.ACTIVE);
        verify(listingRepository).saveAll(List.of(first, second));
    }

    @Test
    void deactivatesEveryActiveListingOfTheSeller() {
        Listing first = listing(ListingStatus.ACTIVE);
        Listing second = listing(ListingStatus.ACTIVE);
        when(listingRepository.findAllOwnedWithStatus(SELLER_ID, ListingStatus.ACTIVE)).thenReturn(List.of(first, second));

        Result<ListingBatchResult> result = service.deactivateAllActive(SELLER_ID);

        assertThat(result.isError()).isFalse();
        assertThat(result.getData().updatedCount()).isEqualTo(2);
        assertThat(first.getStatus()).isEqualTo(ListingStatus.INACTIVE);
        assertThat(second.getStatus()).isEqualTo(ListingStatus.INACTIVE);
        verify(listingRepository).saveAll(List.of(first, second));
    }

    @Test
    void restrictedSellerCannotReactivateAll() {
        when(userRestrictionService.check(SELLER_ID, RestrictedAction.CREATE_LISTING))
                .thenReturn(Result.error("restricted", "USER_RESTRICTED"));

        Result<ListingBatchResult> result = service.reactivateAllInactive(SELLER_ID);

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo("USER_RESTRICTED");
        verifyNoInteractions(listingRepository);
    }

    private Listing listing(ListingStatus status) {
        User seller = new User();
        seller.setId(SELLER_ID);
        return Listing.builder()
                .id(UUID.randomUUID())
                .seller(seller)
                .status(status)
                .listingType(ListingType.VEHICLE)
                .build();
    }
}

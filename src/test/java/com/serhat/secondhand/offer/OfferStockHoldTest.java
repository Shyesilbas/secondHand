package com.serhat.secondhand.offer;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.inventory.util.InventoryErrorCodes;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.offer.application.OfferService;
import com.serhat.secondhand.offer.application.OfferStockHoldService;
import com.serhat.secondhand.offer.config.OfferConfigProperties;
import com.serhat.secondhand.offer.email.OfferEmailNotificationService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferStatus;
import com.serhat.secondhand.offer.mapper.OfferMapper;
import com.serhat.secondhand.offer.repository.OfferRepository;
import com.serhat.secondhand.offer.scheduler.OfferScheduler;
import com.serhat.secondhand.offer.validator.OfferValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** An accepted offer must hold its stock for the buyer until paid or expired, or another buyer can take it. */
class OfferStockHoldTest {

    private final OfferRepository offerRepository = mock(OfferRepository.class);
    private final ListingQueryService listingService = mock(ListingQueryService.class);
    private final IUserService userService = mock(IUserService.class);
    private final OfferEmailNotificationService notifications = mock(OfferEmailNotificationService.class);
    private final OfferValidator validator = mock(OfferValidator.class);
    private final InventoryRedisReservationService inventory = mock(InventoryRedisReservationService.class);
    private final OfferConfigProperties config = new OfferConfigProperties();
    private final OfferStockHoldService stockHold = new OfferStockHoldService(inventory);

    private final OfferService offerService = new OfferService(offerRepository, listingService, userService,
            notifications, validator, mock(OfferMapper.class), stockHold, config, com.serhat.secondhand.user.RestrictionTestSupport.allowAll());
    private final OfferScheduler scheduler = new OfferScheduler(offerRepository, notifications, stockHold);

    private static Offer offer(OfferStatus status, LocalDateTime expiresAt) {
        SportsListing listing = new SportsListing();
        listing.setId(UUID.randomUUID());
        return Offer.builder().id(UUID.randomUUID()).version(3L).status(status).expiresAt(expiresAt)
                .listing(listing).buyer(User.builder().id(1L).build()).seller(User.builder().id(2L).build())
                .quantity(2).build();
    }

    private void stubAccept(Offer offer) {
        when(userService.findById(2L)).thenReturn(Result.success(offer.getSeller()));
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(validator.isBuyerOrSeller(any(), any())).thenReturn(true);
        when(validator.isReceiver(any(), any())).thenReturn(true);
        when(listingService.findByIdWithLock(offer.getListing().getId())).thenReturn(Optional.of(offer.getListing()));
        when(validator.validateListingEligibility(any())).thenReturn(Result.success());
        when(validator.validateListingStockForOffer(any(), any())).thenReturn(Result.success());
        when(offerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void accept_holdsOfferQuantityForBuyerUntilPaymentDeadline() {
        config.setAcceptedPaymentHours(5);
        Offer offer = offer(OfferStatus.PENDING, LocalDateTime.now().plusHours(1));
        stubAccept(offer);

        assertFalse(offerService.accept(2L, offer.getId()).isError());

        ArgumentCaptor<Long> ttl = ArgumentCaptor.forClass(Long.class);
        verify(inventory).reserveStockWithTtl(eq(1L), eq(offer.getListing().getId()), eq(2), ttl.capture());
        assertTrue(Math.abs(ttl.getValue() - 5 * 3600L) < 60, "hold TTL must match the payment deadline, was " + ttl.getValue());
    }

    @Test
    void accept_failsAndStaysPendingWhenStockCannotBeHeld() {
        Offer offer = offer(OfferStatus.PENDING, LocalDateTime.now().plusHours(1));
        stubAccept(offer);
        doThrow(new BusinessException(InventoryErrorCodes.INSUFFICIENT_STOCK))
                .when(inventory).reserveStockWithTtl(any(), any(), anyInt(), any());

        Result<?> result = offerService.accept(2L, offer.getId());

        assertTrue(result.isError());
        assertEquals(InventoryErrorCodes.INSUFFICIENT_STOCK.getCode(), result.getErrorCode());
        assertEquals(OfferStatus.PENDING, offer.getStatus());
        verify(offerRepository, never()).save(any());
    }

    @Test
    void scheduler_releasesHoldOfExpiredAcceptedOffer() {
        Offer offer = offer(OfferStatus.ACCEPTED, LocalDateTime.now().minusMinutes(1));
        when(offerRepository.findAllByStatusInAndExpiresAtBefore(eq(OfferStatus.EXPIRABLE), any())).thenReturn(List.of(offer));
        when(offerRepository.expireIfOverdue(any(), any(), any(), any())).thenReturn(1);

        scheduler.checkExpiredOffers();

        verify(inventory).cancelUserReservation(1L, offer.getListing().getId());
    }

    @Test
    void scheduler_doesNotTouchStockForExpiredPendingOffer() {
        Offer offer = offer(OfferStatus.PENDING, LocalDateTime.now().minusMinutes(1));
        when(offerRepository.findAllByStatusInAndExpiresAtBefore(eq(OfferStatus.EXPIRABLE), any())).thenReturn(List.of(offer));
        when(offerRepository.expireIfOverdue(any(), any(), any(), any())).thenReturn(1);

        scheduler.checkExpiredOffers();

        verifyNoInteractions(inventory);
    }

    @Test
    void scheduler_keepsHoldWhenCheckoutCompletedOfferFirst() {
        Offer offer = offer(OfferStatus.ACCEPTED, LocalDateTime.now().minusMinutes(1));
        when(offerRepository.findAllByStatusInAndExpiresAtBefore(eq(OfferStatus.EXPIRABLE), any())).thenReturn(List.of(offer));
        when(offerRepository.expireIfOverdue(any(), any(), any(), any())).thenReturn(0);

        scheduler.checkExpiredOffers();

        verifyNoInteractions(inventory);
    }
}

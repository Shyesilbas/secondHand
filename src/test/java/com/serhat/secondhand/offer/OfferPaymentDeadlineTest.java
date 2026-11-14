package com.serhat.secondhand.offer;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.offer.application.OfferService;
import com.serhat.secondhand.offer.application.OfferStockHoldService;
import com.serhat.secondhand.offer.config.OfferConfigProperties;
import com.serhat.secondhand.offer.email.OfferEmailNotificationService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferStatus;
import com.serhat.secondhand.offer.mapper.OfferMapper;
import com.serhat.secondhand.offer.repository.OfferRepository;
import com.serhat.secondhand.offer.scheduler.OfferScheduler;
import com.serhat.secondhand.offer.util.OfferErrorCodes;
import com.serhat.secondhand.offer.validator.OfferValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** An accepted offer must expire at its payment deadline, or it blocks every further accept on the listing. */
class OfferPaymentDeadlineTest {

    private final OfferRepository offerRepository = mock(OfferRepository.class);
    private final ListingQueryService listingService = mock(ListingQueryService.class);
    private final IUserService userService = mock(IUserService.class);
    private final OfferEmailNotificationService notifications = mock(OfferEmailNotificationService.class);
    private final OfferValidator validator = mock(OfferValidator.class);
    private final OfferConfigProperties config = new OfferConfigProperties();
    private final OfferStockHoldService stockHold = new OfferStockHoldService(mock(InventoryRedisReservationService.class));

    private final OfferService offerService = new OfferService(offerRepository, listingService, userService,
            notifications, validator, mock(OfferMapper.class), stockHold, config, com.serhat.secondhand.user.RestrictionTestSupport.allowAll());
    private final OfferScheduler scheduler = new OfferScheduler(offerRepository, notifications, stockHold);

    private static Offer offer(OfferStatus status, LocalDateTime expiresAt) {
        SportsListing listing = new SportsListing();
        listing.setId(UUID.randomUUID());
        User buyer = User.builder().id(1L).build();
        User seller = User.builder().id(2L).build();
        return Offer.builder().id(UUID.randomUUID()).version(3L).status(status).expiresAt(expiresAt)
                .listing(listing).buyer(buyer).seller(seller).quantity(1).build();
    }

    @Test
    void accept_setsPaymentDeadline() {
        config.setAcceptedPaymentHours(5);
        Offer offer = offer(OfferStatus.PENDING, LocalDateTime.now().plusHours(1));
        when(userService.findById(2L)).thenReturn(Result.success(offer.getSeller()));
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(validator.isBuyerOrSeller(any(), any())).thenReturn(true);
        when(validator.isReceiver(any(), any())).thenReturn(true);
        when(listingService.findByIdWithLock(offer.getListing().getId())).thenReturn(Optional.of(offer.getListing()));
        when(validator.validateListingEligibility(any())).thenReturn(Result.success());
        when(validator.validateListingStockForOffer(any(), any())).thenReturn(Result.success());
        when(offerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertFalse(offerService.accept(2L, offer.getId()).isError());

        assertEquals(OfferStatus.ACCEPTED, offer.getStatus());
        LocalDateTime expected = LocalDateTime.now().plusHours(5);
        assertTrue(Math.abs(java.time.Duration.between(expected, offer.getExpiresAt()).toSeconds()) < 60,
                "expiresAt must become the payment deadline, was " + offer.getExpiresAt());
    }

    @Test
    void checkout_rejectsAcceptedOfferPastPaymentDeadline() {
        Offer offer = offer(OfferStatus.ACCEPTED, LocalDateTime.now().minusMinutes(1));
        when(offerRepository.findByIdAndBuyerId(offer.getId(), 1L)).thenReturn(Optional.of(offer));

        Result<Offer> result = offerService.getAcceptedOfferForCheckout(1L, offer.getId());

        assertTrue(result.isError());
        assertEquals(OfferErrorCodes.OFFER_EXPIRED.getCode(), result.getErrorCode());
        verifyNoInteractions(listingService);
    }

    @Test
    void scheduler_expiresOverdueAcceptedOffer() {
        Offer offer = offer(OfferStatus.ACCEPTED, LocalDateTime.now().minusMinutes(1));
        when(offerRepository.findAllByStatusInAndExpiresAtBefore(eq(OfferStatus.EXPIRABLE), any())).thenReturn(List.of(offer));
        when(offerRepository.expireIfOverdue(eq(offer.getId()), eq(3L), eq(OfferStatus.EXPIRABLE), any())).thenReturn(1);

        scheduler.checkExpiredOffers();

        assertTrue(OfferStatus.EXPIRABLE.contains(OfferStatus.ACCEPTED));
        verify(offerRepository).expireIfOverdue(eq(offer.getId()), eq(3L), eq(OfferStatus.EXPIRABLE), any());
        verify(notifications).notifyExpiredToBoth(offer);
    }

    @Test
    void scheduler_skipsOfferCompletedByConcurrentCheckout() {
        Offer offer = offer(OfferStatus.ACCEPTED, LocalDateTime.now().minusMinutes(1));
        when(offerRepository.findAllByStatusInAndExpiresAtBefore(eq(OfferStatus.EXPIRABLE), any())).thenReturn(List.of(offer));
        when(offerRepository.expireIfOverdue(any(), any(), any(), any())).thenReturn(0);

        scheduler.checkExpiredOffers();

        verify(notifications, never()).notifyExpiredToBoth(any());
        verify(offerRepository, never()).saveAll(any());
    }
}

package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ListingPaymentHandlerTest {

    private static final BigDecimal FEE = new BigDecimal("120.00");

    private final ListingRepository listingRepository = mock(ListingRepository.class);
    private final ListingCommandService listingCommandService = mock(ListingCommandService.class);
    private final ListingPaymentHandler handler = new ListingPaymentHandler(listingRepository, listingCommandService);

    private final UUID listingId = UUID.randomUUID();
    private final Listing listing = Listing.builder().id(listingId).seller(User.builder().id(1L).build()).build();

    @Test
    void ownerPayingFullFee_publishesListing() {
        stubListingAndFee();

        handler.handleListingCreation(payment(1L, FEE));

        assertThat(listing.isListingFeePaid()).isTrue();
        verify(listingCommandService).publish(listingId, 1L);
    }

    @Test
    void paymentBelowFee_doesNotPublish() {
        stubListingAndFee();

        handler.handleListingCreation(payment(1L, new BigDecimal("0.01")));

        assertThat(listing.isListingFeePaid()).isFalse();
        verify(listingCommandService, never()).publish(any(), any());
    }

    @Test
    void paymentByAnotherUser_doesNotPublish() {
        stubListingAndFee();

        handler.handleListingCreation(payment(2L, FEE));

        assertThat(listing.isListingFeePaid()).isFalse();
        verify(listingCommandService, never()).publish(any(), any());
    }

    private void stubListingAndFee() {
        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(listingCommandService.calculateTotalListingFee()).thenReturn(FEE);
    }

    private Payment payment(Long payerId, BigDecimal amount) {
        return Payment.builder()
                .fromUser(User.builder().id(payerId).build())
                .amount(amount)
                .listingId(listingId)
                .transactionType(PaymentTransactionType.LISTING_CREATION)
                .build();
    }
}

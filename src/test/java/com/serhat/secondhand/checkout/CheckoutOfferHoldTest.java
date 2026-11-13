package com.serhat.secondhand.checkout;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.checkout.application.CheckoutOrchestrator;
import com.serhat.secondhand.checkout.application.CheckoutPricingContextFactory;
import com.serhat.secondhand.checkout.application.CheckoutStockReservationService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.application.CouponService;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.order.application.OrderCreationService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.application.OrderPaymentService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** A failed offer checkout must give back what it reserved, but never the accepted offer's own stock hold. */
class CheckoutOfferHoldTest {

    private final OrderCreationService orderCreationService = mock(OrderCreationService.class);
    private final CheckoutPricingContextFactory pricingContextFactory = mock(CheckoutPricingContextFactory.class);
    private final CheckoutStockReservationService stockReservation = mock(CheckoutStockReservationService.class);

    private final CheckoutOrchestrator orchestrator = new CheckoutOrchestrator(mock(CartRepository.class),
            orderCreationService, mock(OrderPaymentService.class), mock(OrderRepository.class), mock(OrderMapper.class),
            mock(CouponService.class), mock(IOfferService.class), mock(EscrowService.class), pricingContextFactory,
            stockReservation, mock(ApplicationEventPublisher.class));

    @Test
    void failedOfferCheckout_keepsOfferHold() {
        SportsListing offerListing = new SportsListing();
        offerListing.setId(UUID.randomUUID());
        UUID otherListingId = UUID.randomUUID();
        Offer offer = Offer.builder().id(UUID.randomUUID()).listing(offerListing).quantity(1).build();
        User user = User.builder().id(1L).build();
        CheckoutRequest request = mock(CheckoutRequest.class);
        when(pricingContextFactory.build(1L, request)).thenReturn(Result.success(
                new CheckoutPricingContextFactory.CheckoutPricingContext(user, List.<Cart>of(), offer, mock(PricingResultDto.class))));
        Map<UUID, Integer> reserved = new HashMap<>(Map.of(offerListing.getId(), 1, otherListingId, 2));
        when(stockReservation.reserveStock(eq(1L), any())).thenReturn(Result.success(reserved));
        when(orderCreationService.createOrders(any(), any(), any(), any())).thenReturn(Result.error("order failed"));

        try (MockedStatic<TransactionAspectSupport> tx = mockStatic(TransactionAspectSupport.class)) {
            tx.when(TransactionAspectSupport::currentTransactionStatus).thenReturn(mock(TransactionStatus.class));
            assertTrue(orchestrator.executeCheckout(1L, request).isError());
        }

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<UUID, Integer>> released = ArgumentCaptor.forClass(Map.class);
        verify(stockReservation, atLeastOnce()).releaseReservedStock(eq(1L), released.capture());
        for (Map<UUID, Integer> map : released.getAllValues()) {
            assertFalse(map.containsKey(offerListing.getId()), "offer hold must survive a failed checkout");
            assertEquals(2, map.get(otherListingId));
        }
    }
}

package com.serhat.secondhand.payment.application.handlers;

import com.serhat.secondhand.listing.application.common.ListingPaymentHandler;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.application.PaymentCompletedHandleResult;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentCompletedHandlersTest {

    private DefaultPaymentCompletedHandler defaultHandler;
    private ItemPurchasePaymentCompletedHandler purchaseHandler;
    private ListingCreationPaymentCompletedHandler creationHandler;

    private ListingPaymentHandler listingPaymentHandler;
    private Payment payment;

    @BeforeEach
    void setUp() {
        listingPaymentHandler = mock(ListingPaymentHandler.class);

        defaultHandler = new DefaultPaymentCompletedHandler();
        purchaseHandler = new ItemPurchasePaymentCompletedHandler(listingPaymentHandler);
        creationHandler = new ListingCreationPaymentCompletedHandler(listingPaymentHandler);

        payment = new Payment();
    }

    @Test
    void defaultHandler_ShouldNeverSupport_AndReturnEmptyResult() {
        assertFalse(defaultHandler.supports(payment));
        PaymentCompletedHandleResult result = defaultHandler.handle(payment);
        assertNotNull(result);
        assertNull(result.listingTitle());
    }

    @Test
    void purchaseHandler_ShouldSupportItemPurchase_AndDelegateToListingPaymentHandler() {
        payment.setTransactionType(PaymentTransactionType.ITEM_PURCHASE);
        assertTrue(purchaseHandler.supports(payment));

        payment.setTransactionType(PaymentTransactionType.LISTING_CREATION);
        assertFalse(purchaseHandler.supports(payment));

        // Test handle
        payment.setTransactionType(PaymentTransactionType.ITEM_PURCHASE);
        Listing mockListing = new Listing();
        mockListing.setTitle("Super Electronics Bundle");
        when(listingPaymentHandler.handleItemPurchase(payment)).thenReturn(mockListing);

        PaymentCompletedHandleResult result = purchaseHandler.handle(payment);

        assertNotNull(result);
        assertEquals("Super Electronics Bundle", result.listingTitle());
        verify(listingPaymentHandler).handleItemPurchase(payment);
    }

    @Test
    void creationHandler_ShouldSupportListingCreation_AndDelegateToListingPaymentHandler() {
        payment.setTransactionType(PaymentTransactionType.LISTING_CREATION);
        assertTrue(creationHandler.supports(payment));

        payment.setTransactionType(PaymentTransactionType.ITEM_PURCHASE);
        assertFalse(creationHandler.supports(payment));

        // Test handle
        payment.setTransactionType(PaymentTransactionType.LISTING_CREATION);
        Listing mockListing = new Listing();
        mockListing.setTitle("Cozy Apartment");
        when(listingPaymentHandler.handleListingCreation(payment)).thenReturn(mockListing);

        PaymentCompletedHandleResult result = creationHandler.handle(payment);

        assertNotNull(result);
        assertEquals("Cozy Apartment", result.listingTitle());
        verify(listingPaymentHandler).handleListingCreation(payment);
    }
}

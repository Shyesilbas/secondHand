package com.serhat.secondhand.checkout;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.checkout.application.CheckoutStockReservationService;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;

class CheckoutStockReservationServiceTest {

    private final InventoryRedisReservationService redis = mock(InventoryRedisReservationService.class);
    private final CheckoutStockReservationService service = new CheckoutStockReservationService(
            mock(ListingRepository.class), redis, mock(CartRepository.class));

    @AfterEach
    void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    private static Order orderWithItem(UUID listingId, long itemId, int quantity) {
        SportsListing listing = new SportsListing();
        listing.setId(listingId);
        OrderItem item = OrderItem.builder().id(itemId).listing(listing).quantity(quantity).build();
        Order order = new Order();
        order.setOrderItems(new ArrayList<>(List.of(item)));
        return order;
    }

    @Test
    void reservationsAreConvertedOnlyAfterCommit() {
        UUID listingId = UUID.randomUUID();
        TransactionSynchronizationManager.initSynchronization();

        service.consumeReservationsOnSuccess(7L, orderWithItem(listingId, 77L, 2));
        verifyNoInteractions(redis);

        TransactionSynchronizationManager.getSynchronizations().forEach(TransactionSynchronization::afterCommit);
        verify(redis).consumeReservationOnPurchase(7L, listingId, 77L, 2);
    }

    @Test
    void rollback_leavesReservationsInPlace() {
        TransactionSynchronizationManager.initSynchronization();

        service.consumeReservationsOnSuccess(7L, orderWithItem(UUID.randomUUID(), 77L, 1));
        TransactionSynchronizationManager.getSynchronizations()
                .forEach(s -> s.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));

        verifyNoInteractions(redis);
    }
}

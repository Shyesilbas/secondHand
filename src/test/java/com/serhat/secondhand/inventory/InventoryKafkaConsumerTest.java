package com.serhat.secondhand.inventory;

import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.inventory.application.InventoryKafkaConsumer;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventoryKafkaConsumerTest {

    private final InventoryService inventoryService = mock(InventoryService.class);
    private final ListingRepository listingRepository = mock(ListingRepository.class);
    private final ProcessedKafkaEventRepository processed = mock(ProcessedKafkaEventRepository.class);
    private final InventoryRedisReservationService redisReservations = mock(InventoryRedisReservationService.class);
    private final InventoryKafkaConsumer consumer =
            new InventoryKafkaConsumer(inventoryService, listingRepository, processed, redisReservations);

    @AfterEach
    void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    private PaymentCompletedKafkaEvent event(String type) {
        return event(type, null);
    }

    private PaymentCompletedKafkaEvent event(String type, Long orderItemId) {
        return new PaymentCompletedKafkaEvent(UUID.randomUUID(), "k", 1L, "a@b.c", null, null, BigDecimal.TEN, "TRY",
                "EWALLET", UUID.randomUUID(), orderItemId, 1, "COMPLETED", LocalDateTime.now(), type);
    }

    @Test
    void listingFeeDoesNotTouchInventory() {
        consumer.consumePaymentCompleted(event("LISTING_CREATION"));
        verifyNoInteractions(inventoryService);
        verify(processed, never()).insertIfNotExists(any(), any());
    }

    @Test
    void itemPurchaseDeductsStock() {
        when(processed.insertIfNotExists(any(), any())).thenReturn(1);
        when(listingRepository.existsById(any())).thenReturn(true);
        when(inventoryService.getAvailableQuantity(any())).thenReturn(5);
        consumer.consumePaymentCompleted(event("ITEM_PURCHASE"));
        verify(inventoryService).reserveQuantity(any(), anyInt());
    }

    @Test
    void pendingPurchaseMarker_isClearedOnlyAfterDeductionCommits() {
        when(processed.insertIfNotExists(any(), any())).thenReturn(1);
        when(listingRepository.existsById(any())).thenReturn(true);
        when(inventoryService.getAvailableQuantity(any())).thenReturn(5);
        PaymentCompletedKafkaEvent purchase = event("ITEM_PURCHASE", 77L);
        TransactionSynchronizationManager.initSynchronization();

        consumer.consumePaymentCompleted(purchase);
        verifyNoInteractions(redisReservations);

        TransactionSynchronizationManager.getSynchronizations().forEach(TransactionSynchronization::afterCommit);
        verify(redisReservations).clearPendingPurchase(purchase.listingId(), 77L);
    }

    @Test
    void failedDeduction_keepsPendingPurchaseMarker() {
        when(processed.insertIfNotExists(any(), any())).thenReturn(1);
        when(listingRepository.existsById(any())).thenReturn(true);
        doThrow(new IllegalStateException("db down")).when(inventoryService).reserveQuantity(any(), anyInt());
        TransactionSynchronizationManager.initSynchronization();

        try {
            consumer.consumePaymentCompleted(event("ITEM_PURCHASE", 77L));
        } catch (IllegalStateException expected) {
            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(s -> s.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
        }

        verifyNoInteractions(redisReservations);
    }

    @Test
    void listingFee_doesNotTouchPendingPurchaseMarkers() {
        consumer.consumePaymentCompleted(event("LISTING_CREATION", 77L));
        verifyNoInteractions(redisReservations);
    }
}

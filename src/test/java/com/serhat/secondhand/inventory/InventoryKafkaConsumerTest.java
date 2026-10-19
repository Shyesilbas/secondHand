package com.serhat.secondhand.inventory;

import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.inventory.application.InventoryKafkaConsumer;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import org.junit.jupiter.api.Test;

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
    private final InventoryKafkaConsumer consumer = new InventoryKafkaConsumer(inventoryService, listingRepository, processed);

    private PaymentCompletedKafkaEvent event(String type) {
        return new PaymentCompletedKafkaEvent(UUID.randomUUID(), "k", 1L, "a@b.c", null, null, BigDecimal.TEN, "TRY",
                "EWALLET", UUID.randomUUID(), null, 1, "COMPLETED", LocalDateTime.now(), type);
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
}

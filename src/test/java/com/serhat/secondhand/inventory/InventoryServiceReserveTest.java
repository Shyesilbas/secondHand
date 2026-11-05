package com.serhat.secondhand.inventory;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.inventory.domain.entity.Inventory;
import com.serhat.secondhand.inventory.domain.repository.InventoryRepository;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventoryServiceReserveTest {

    private final InventoryRepository repository = mock(InventoryRepository.class);
    private final InventoryService service = new InventoryService(repository, mock(ListingRepository.class));
    private final UUID listingId = UUID.randomUUID();

    private void stock(Integer available) {
        when(repository.findByListingId(listingId))
                .thenReturn(Optional.of(Inventory.builder().listingId(listingId).availableQuantity(available).build()));
    }

    @Test
    void reserve_usesConditionalUpdateInsteadOfReadModifyWrite() {
        stock(3);
        when(repository.deductIfAvailable(listingId, 2)).thenReturn(1);

        service.reserveQuantity(listingId, 2);

        verify(repository).deductIfAvailable(listingId, 2);
        verify(repository, never()).save(any());
    }

    @Test
    void reserve_whenConditionalUpdateMatchesNoRow_isInsufficientStock() {
        stock(1);
        when(repository.deductIfAvailable(listingId, 2)).thenReturn(0);

        assertThatThrownBy(() -> service.reserveQuantity(listingId, 2))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo("INVENTORY_INSUFFICIENT_STOCK");
    }

    @Test
    void reserve_nonPositiveQuantity_isRejected() {
        assertThatThrownBy(() -> service.reserveQuantity(listingId, 0))
                .extracting("errorCode").isEqualTo("INVENTORY_INVALID_QUANTITY");
        verifyNoInteractions(repository);
    }
}

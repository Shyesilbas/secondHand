package com.serhat.secondhand.inventory;

import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.inventory.application.InventoryService;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class InventoryRedisReservationServiceTest {

    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final InventoryRedisReservationService service =
            new InventoryRedisReservationService(redis, mock(InventoryService.class));

    @Test
    void purchase_writesPendingMarkerBeforeDeletingReservation() {
        when(redis.opsForValue()).thenReturn(values);
        UUID listingId = UUID.randomUUID();

        service.consumeReservationOnPurchase(7L, listingId, 77L, 2);

        // Reverse order would leave a moment with neither key, letting reconciliation hand the units out again
        InOrder order = inOrder(values, redis);
        order.verify(values).set(eq("v4:inventory:pending:77:" + listingId), eq("2"), any(Duration.class));
        order.verify(redis).delete("v4:inventory:reservation:7:" + listingId);
    }
}

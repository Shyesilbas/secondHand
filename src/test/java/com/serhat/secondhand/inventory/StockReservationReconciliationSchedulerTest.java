package com.serhat.secondhand.inventory;

import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.inventory.application.StockReservationReconciliationScheduler;
import com.serhat.secondhand.inventory.domain.entity.Inventory;
import com.serhat.secondhand.inventory.domain.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class StockReservationReconciliationSchedulerTest {

    private static final UUID LISTING = UUID.fromString("00000000-0000-0000-0000-0000000000aa");
    private static final String STOCK_KEY = "v4:inventory:stock:" + LISTING;

    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final InventoryRepository inventoryRepository = mock(InventoryRepository.class);
    private final InventoryRedisReservationService reservations = mock(InventoryRedisReservationService.class);
    private final StockReservationReconciliationScheduler scheduler =
            new StockReservationReconciliationScheduler(redis, inventoryRepository, reservations);

    @BeforeEach
    void setUp() {
        when(redis.opsForValue()).thenReturn(values);
        when(reservations.compareAndSetStock(any(), anyString(), anyInt())).thenReturn(true);
    }

    private void givenRedis(String stock, Map<String, String> reservationKeys, Map<String, String> pendingKeys) {
        stubScan("v4:inventory:stock:*", List.of(STOCK_KEY));
        when(values.get(STOCK_KEY)).thenReturn(stock);
        stubScan("v4:inventory:reservation:*", List.copyOf(reservationKeys.keySet()));
        reservationKeys.forEach((k, v) -> when(values.get(k)).thenReturn(v));
        stubScan("v4:inventory:pending:*", List.copyOf(pendingKeys.keySet()));
        pendingKeys.forEach((k, v) -> when(values.get(k)).thenReturn(v));
    }

    private void givenDbAvailable(int available) {
        when(inventoryRepository.findByListingIdIn(List.of(LISTING)))
                .thenReturn(List.of(Inventory.builder().listingId(LISTING).availableQuantity(available).build()));
    }

    @SuppressWarnings("unchecked")
    private void stubScan(String pattern, List<String> keys) {
        Iterator<String> it = keys.iterator();
        Cursor<String> cursor = mock(Cursor.class);
        when(cursor.hasNext()).thenAnswer(i -> it.hasNext());
        when(cursor.next()).thenAnswer(i -> it.next());
        doCallRealMethod().when(cursor).forEachRemaining(any());
        when(redis.scan(argThat((ScanOptions o) -> o != null && pattern.equals(o.getPattern())))).thenReturn(cursor);
    }

    @Test
    void expiredReservation_restoresStockFromDatabase() {
        givenRedis("3", Map.of(), Map.of());
        givenDbAvailable(5);

        scheduler.reconcileOrphanedStockReservations();

        verify(reservations).compareAndSetStock(LISTING, "3", 5);
    }

    @Test
    void paidButNotYetDeductedPurchase_isNotHandedOutAgain() {
        // Reservation consumed at checkout, PostgreSQL not yet decremented by InventoryKafkaConsumer
        givenRedis("4", Map.of(), Map.of("v4:inventory:pending:77:" + LISTING, "1"));
        givenDbAvailable(5);

        scheduler.reconcileOrphanedStockReservations();

        verify(reservations, never()).compareAndSetStock(any(), anyString(), anyInt());
    }

    @Test
    void activeReservationsAndPendingPurchases_areSubtracted() {
        givenRedis("1", Map.of("v4:inventory:reservation:9:" + LISTING, "2"),
                Map.of("v4:inventory:pending:77:" + LISTING, "1"));
        givenDbAvailable(5);

        scheduler.reconcileOrphanedStockReservations();

        // 5 - 2 reserved - 1 pending = 2
        verify(reservations).compareAndSetStock(LISTING, "1", 2);
    }

    @Test
    void holdsOfOtherListings_areNotCounted() {
        UUID other = UUID.randomUUID();
        givenRedis("5", Map.of("v4:inventory:reservation:9:" + other, "2"), Map.of());
        givenDbAvailable(5);

        scheduler.reconcileOrphanedStockReservations();

        verify(reservations, never()).compareAndSetStock(any(), anyString(), anyInt());
    }

    @Test
    void holdsAboveDatabaseQuantity_clampToZero() {
        givenRedis("1", Map.of(), Map.of("v4:inventory:pending:77:" + LISTING, "2"));
        givenDbAvailable(1);

        scheduler.reconcileOrphanedStockReservations();

        verify(reservations).compareAndSetStock(LISTING, "1", 0);
    }

    @Test
    void unreadableHold_skipsListing() {
        givenRedis("3", Map.of("v4:inventory:reservation:9:" + LISTING, "abc"), Map.of());
        givenDbAvailable(5);

        scheduler.reconcileOrphanedStockReservations();

        verify(reservations, never()).compareAndSetStock(any(), anyString(), anyInt());
    }

    @Test
    void concurrentChange_isNotOverwrittenAndDoesNotFail() {
        givenRedis("3", Map.of(), Map.of());
        givenDbAvailable(5);
        when(reservations.compareAndSetStock(LISTING, "3", 5)).thenReturn(false);

        scheduler.reconcileOrphanedStockReservations();

        verify(reservations).compareAndSetStock(LISTING, "3", 5);
        verify(values, never()).set(anyString(), anyString());
    }
}

package com.serhat.secondhand.order;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.OrderCancellationService;
import com.serhat.secondhand.order.application.OrderCompletionScheduler;
import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.shipping.entity.Shipping;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class OrderCompletionSchedulerTest {

    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final EscrowService escrowService = mock(EscrowService.class);
    private final OrderCancellationService cancellationService = mock(OrderCancellationService.class);
    private final OrderLogService orderLog = mock(OrderLogService.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    private final PlatformTransactionManager txManager = mock(PlatformTransactionManager.class);
    private final TransactionStatus txStatus = mock(TransactionStatus.class);

    private final OrderCompletionScheduler scheduler =
            new OrderCompletionScheduler(orderRepository, escrowService, cancellationService, orderLog, events, txManager);

    @BeforeEach
    void setUp() {
        when(txManager.getTransaction(any())).thenReturn(txStatus);
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
    }

    private Order order(long id, OrderStatus status, LocalDateTime updatedAt) {
        Order order = Order.builder().id(id).orderNumber("ORD-" + id).status(status).build();
        order.setUpdatedAt(updatedAt);
        order.setCreatedAt(updatedAt);
        return order;
    }

    @Test
    void dueConfirmedOrder_isMovedToProcessingInItsOwnTransaction() {
        Order due = order(1L, OrderStatus.CONFIRMED, LocalDateTime.now().minusMinutes(10));
        when(orderRepository.findIdsByStatusTouchedBefore(eq(OrderStatus.CONFIRMED), any(), any())).thenReturn(List.of(1L));
        when(orderRepository.findByIdWithShippingAndUser(1L)).thenReturn(Optional.of(due));

        scheduler.autoUpdateOrderStatus();

        assertThat(due.getStatus()).isEqualTo(OrderStatus.PROCESSING);
        verify(txManager).commit(txStatus);
        verify(orderLog).logSchedulerCompleted(1);
    }

    @Test
    void orderThatChangedStatusAfterIdQuery_isSkipped() {
        Order alreadyMoved = order(1L, OrderStatus.CANCELLED, LocalDateTime.now().minusMinutes(10));
        when(orderRepository.findIdsByStatusTouchedBefore(eq(OrderStatus.CONFIRMED), any(), any())).thenReturn(List.of(1L));
        when(orderRepository.findByIdWithShippingAndUser(1L)).thenReturn(Optional.of(alreadyMoved));

        scheduler.autoUpdateOrderStatus();

        assertThat(alreadyMoved.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(orderRepository, never()).save(any());
        verify(orderLog).logSchedulerCompleted(0);
    }

    @Test
    void nonPremiumOrderInsidePremiumWindow_isNotMovedYet() {
        // Id query uses the shorter premium interval; the exact per-order check still applies 5 minutes.
        Order early = order(1L, OrderStatus.CONFIRMED, LocalDateTime.now().minusMinutes(3));
        when(orderRepository.findIdsByStatusTouchedBefore(eq(OrderStatus.CONFIRMED), any(), any())).thenReturn(List.of(1L));
        when(orderRepository.findByIdWithShippingAndUser(1L)).thenReturn(Optional.of(early));

        scheduler.autoUpdateOrderStatus();

        assertThat(early.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(orderRepository, never()).save(any());
    }

    @Test
    void failingOrder_isRolledBackAndDoesNotStopTheRest() {
        Order ok = order(2L, OrderStatus.CONFIRMED, LocalDateTime.now().minusMinutes(10));
        when(orderRepository.findIdsByStatusTouchedBefore(eq(OrderStatus.CONFIRMED), any(), any())).thenReturn(List.of(1L, 2L));
        when(orderRepository.findByIdWithShippingAndUser(1L)).thenThrow(new IllegalStateException("db down"));
        when(orderRepository.findByIdWithShippingAndUser(2L)).thenReturn(Optional.of(ok));

        scheduler.autoUpdateOrderStatus();

        assertThat(ok.getStatus()).isEqualTo(OrderStatus.PROCESSING);
        verify(txManager).rollback(txStatus);
        verify(txManager).commit(txStatus);
        verify(orderLog).logSchedulerCompleted(1);
    }

    @Test
    void deliveredOrder_isNotCompletedWhenEscrowReleaseFails() {
        Order delivered = order(5L, OrderStatus.DELIVERED, LocalDateTime.now().minusDays(4));
        delivered.setShipping(Shipping.builder().deliveredAt(LocalDateTime.now().minusHours(73)).build());
        when(orderRepository.findIdsByStatusDeliveredBefore(eq(OrderStatus.DELIVERED), any(), any())).thenReturn(List.of(5L));
        when(orderRepository.findByIdWithShippingAndUser(5L)).thenReturn(Optional.of(delivered));
        when(escrowService.release(delivered)).thenReturn(Result.error("escrow unavailable"));

        scheduler.autoUpdateOrderStatus();

        assertThat(delivered.getStatus()).isEqualTo(OrderStatus.DELIVERED);
        verify(orderRepository, never()).save(any());
        verify(events, never()).publishEvent(any());
    }

    @Test
    void deliveredOrder_isCompletedAfterEscrowRelease() {
        Order delivered = order(5L, OrderStatus.DELIVERED, LocalDateTime.now().minusDays(4));
        delivered.setShipping(Shipping.builder().deliveredAt(LocalDateTime.now().minusHours(73)).build());
        when(orderRepository.findIdsByStatusDeliveredBefore(eq(OrderStatus.DELIVERED), any(), any())).thenReturn(List.of(5L));
        when(orderRepository.findByIdWithShippingAndUser(5L)).thenReturn(Optional.of(delivered));
        when(escrowService.release(delivered)).thenReturn(Result.success());

        scheduler.autoUpdateOrderStatus();

        assertThat(delivered.getStatus()).isEqualTo(OrderStatus.COMPLETED);
        verify(orderLog).logOrderCompleted("ORD-5", true);
    }

    @Test
    void processingOrderPastShipDeadline_isCancelledBySystem() {
        Order late = order(7L, OrderStatus.PROCESSING, LocalDateTime.now().minusHours(73));
        late.setDeliveryMethod(DeliveryMethod.CARGO);
        when(orderRepository.findIdsByStatusCreatedBefore(eq(OrderStatus.PROCESSING), eq(DeliveryMethod.CARGO), any(), any()))
                .thenReturn(List.of(7L));
        when(orderRepository.findByIdWithShippingAndUser(7L)).thenReturn(Optional.of(late));
        when(cancellationService.cancelUnshippedOrder(7L)).thenReturn(Result.success());

        scheduler.autoUpdateOrderStatus();

        verify(cancellationService).cancelUnshippedOrder(7L);
        verify(orderLog).logSchedulerCompleted(1);
    }

    @Test
    void processingOrderInsideShipDeadline_isNeitherShippedNorCancelled() {
        Order recent = order(8L, OrderStatus.PROCESSING, LocalDateTime.now().minusHours(10));
        recent.setDeliveryMethod(DeliveryMethod.CARGO);
        when(orderRepository.findIdsByStatusCreatedBefore(eq(OrderStatus.PROCESSING), eq(DeliveryMethod.CARGO), any(), any()))
                .thenReturn(List.of(8L));
        when(orderRepository.findByIdWithShippingAndUser(8L)).thenReturn(Optional.of(recent));

        scheduler.autoUpdateOrderStatus();

        assertThat(recent.getStatus()).isEqualTo(OrderStatus.PROCESSING);
        verify(cancellationService, never()).cancelUnshippedOrder(any());
        verify(orderRepository, never()).save(any());
    }
}

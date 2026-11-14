package com.serhat.secondhand.order.application.listener;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.application.OrderCancellationService;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class BannedSellerOrderCancellationListenerTest {

    private final OrderRepository orders = mock(OrderRepository.class);
    private final OrderCancellationService cancellation = mock(OrderCancellationService.class);
    private final PlatformTransactionManager txManager = mock(PlatformTransactionManager.class);
    private final BannedSellerOrderCancellationListener listener =
            new BannedSellerOrderCancellationListener(orders, cancellation, txManager);

    {
        when(txManager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
    }

    @Test
    void cancelsEveryUnshippedOrderOfTheSellerInItsOwnTransaction() {
        when(orders.findIdsOfSellerOnlyOrders(eq(7L), anyCollection(), eq(DeliveryMethod.CARGO), any()))
                .thenReturn(List.of(1L, 2L), List.of());
        when(cancellation.cancelForRestrictedSeller(anyLong())).thenReturn(Result.success(new OrderDto()));

        int cancelled = listener.cancelUnshippedOrdersOf(7L);

        assertThat(cancelled).isEqualTo(2);
        verify(cancellation).cancelForRestrictedSeller(1L);
        verify(cancellation).cancelForRestrictedSeller(2L);
        verify(txManager, times(2)).getTransaction(any());
        verify(txManager, times(2)).commit(any());
    }

    @Test
    void failedOrderDoesNotStopTheOthersAndIsNotRetriedForever() {
        // Order 1 keeps failing and stays in every batch; order 2 succeeds and drops out.
        when(orders.findIdsOfSellerOnlyOrders(eq(7L), anyCollection(), eq(DeliveryMethod.CARGO), any()))
                .thenReturn(List.of(1L, 2L), List.of(1L));
        when(cancellation.cancelForRestrictedSeller(1L)).thenReturn(Result.error(OrderErrorCodes.REFUND_FAILED));
        when(cancellation.cancelForRestrictedSeller(2L)).thenReturn(Result.success(new OrderDto()));

        int cancelled = listener.cancelUnshippedOrdersOf(7L);

        assertThat(cancelled).isEqualTo(1);
        verify(cancellation, times(1)).cancelForRestrictedSeller(1L);
    }

    @Test
    void exceptionInOneOrderIsContained() {
        when(orders.findIdsOfSellerOnlyOrders(eq(7L), anyCollection(), eq(DeliveryMethod.CARGO), any()))
                .thenReturn(List.of(1L, 2L), List.of(1L));
        when(cancellation.cancelForRestrictedSeller(1L)).thenThrow(new IllegalStateException("boom"));
        when(cancellation.cancelForRestrictedSeller(2L)).thenReturn(Result.success(new OrderDto()));

        assertThat(listener.cancelUnshippedOrdersOf(7L)).isEqualTo(1);
        verify(txManager).rollback(any());
    }
}

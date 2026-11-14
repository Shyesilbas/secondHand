package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.event.OrderCancellationCause;
import com.serhat.secondhand.order.application.event.OrderCancelledEvent;
import com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.enums.CancelRefundReason;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.outbox.OrderOutboxService;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderCancellationServiceRestrictedSellerTest {

    private final OrderItemCompensationPlanner planner = mock(OrderItemCompensationPlanner.class);
    private final OrderCompensationPersistenceService persistence = mock(OrderCompensationPersistenceService.class);
    private final EscrowService escrow = mock(EscrowService.class);
    private final OrderMapper mapper = mock(OrderMapper.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    private final OrderOutboxService outbox = mock(OrderOutboxService.class);
    private final OrderCancellationService service = new OrderCancellationService(planner,
            mock(OrderCancellationValidationService.class), persistence, escrow, mock(OrderLogService.class),
            mapper, events, outbox);

    private Order order(DeliveryMethod method) {
        User buyer = new User();
        buyer.setId(3L);
        buyer.setEmail("buyer@example.test");
        Order order = new Order();
        order.setId(11L);
        order.setOrderNumber("ORD-11");
        order.setStatus(OrderStatus.CONFIRMED);
        order.setDeliveryMethod(method);
        order.setUser(buyer);
        order.setOrderItems(List.of(new OrderItem()));
        return order;
    }

    @Test
    void restrictedSellerCancellationCarriesItsOwnCauseAndReason() {
        Order order = order(DeliveryMethod.CARGO);
        OrderItemCancel record = mock(OrderItemCancel.class);
        when(record.getOrderItem()).thenReturn(order.getOrderItems().get(0));
        when(persistence.reloadOrderWithItems(11L)).thenReturn(Result.success(order));
        when(planner.validateCancellableItems(any())).thenReturn(Result.success());
        when(planner.buildCancellationPlan(any(), any()))
                .thenReturn(new OrderItemCompensationPlanner.CancellationPlan(List.of(record), BigDecimal.TEN));
        when(escrow.cancel(any(), any())).thenReturn(Result.success());
        when(planner.areAllItemsCancelled(order)).thenReturn(true);
        when(persistence.saveOrderAndReload(order)).thenReturn(Result.success(order));
        when(mapper.toDto(order)).thenReturn(new OrderDto());

        assertThat(service.cancelForRestrictedSeller(11L).isSuccess()).isTrue();

        ArgumentCaptor<OrderCancelRequest> request = ArgumentCaptor.forClass(OrderCancelRequest.class);
        verify(planner).buildCancellationPlan(any(), request.capture());
        assertThat(request.getValue().getReason()).isEqualTo(CancelRefundReason.OTHER);
        assertThat(request.getValue().getReasonText()).isEqualTo(OrderCancellationService.SELLER_RESTRICTED_REASON);

        ArgumentCaptor<OrderCancelledEvent> event = ArgumentCaptor.forClass(OrderCancelledEvent.class);
        verify(events).publishEvent(event.capture());
        assertThat(event.getValue().cause()).isEqualTo(OrderCancellationCause.SELLER_RESTRICTED);
        assertThat(event.getValue().shipDeadlineMissed()).isFalse();
        assertThat(event.getValue().requester()).isSameAs(order.getUser());

        ArgumentCaptor<OrderCancelledKafkaEvent> kafka = ArgumentCaptor.forClass(OrderCancelledKafkaEvent.class);
        verify(outbox).enqueueOrderCancelled(kafka.capture());
        assertThat(kafka.getValue().reason()).isEqualTo(OrderCancellationService.SELLER_RESTRICTED_REASON);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void meetupOrderIsNotCancelledForARestrictedSeller() {
        when(persistence.reloadOrderWithItems(11L)).thenReturn(Result.success(order(DeliveryMethod.SAFE_MEETUP)));

        var result = service.cancelForRestrictedSeller(11L);

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED.getCode());
        verifyNoInteractions(escrow, events, outbox);
    }
}

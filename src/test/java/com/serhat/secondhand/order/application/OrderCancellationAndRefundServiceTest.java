package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.event.OrderCancelledEvent;
import com.serhat.secondhand.order.application.event.OrderRefundedEvent;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.entity.enums.CancelRefundReason;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderRefundPolicy;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusConsistencyLogger;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderCancellationAndRefundServiceTest {

    private OrderCancellationService cancellationService;
    private OrderRefundService refundService;

    // cancellationService deps
    private OrderItemCompensationPlanner compensationPlanner;
    private OrderCancellationValidationService cancellationValidationService;
    private OrderCompensationPersistenceService compensationPersistenceService;
    private EscrowService escrowService;
    private OrderLogService orderLog;
    private OrderMapper orderMapper;
    private ApplicationEventPublisher eventPublisher;

    // refundService deps
    private OrderStatusConsistencyLogger orderStatusConsistencyLogger;
    private OrderValidationService orderValidationService;
    private OrderRefundPolicy orderRefundPolicy;

    private User user;
    private Order order;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        compensationPlanner = mock(OrderItemCompensationPlanner.class);
        cancellationValidationService = mock(OrderCancellationValidationService.class);
        compensationPersistenceService = mock(OrderCompensationPersistenceService.class);
        escrowService = mock(EscrowService.class);
        orderLog = mock(OrderLogService.class);
        orderMapper = mock(OrderMapper.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        orderStatusConsistencyLogger = mock(OrderStatusConsistencyLogger.class);
        orderValidationService = mock(OrderValidationService.class);
        orderRefundPolicy = mock(OrderRefundPolicy.class);

        cancellationService = new OrderCancellationService(
                compensationPlanner,
                cancellationValidationService,
                compensationPersistenceService,
                escrowService,
                orderLog,
                orderMapper,
                eventPublisher
        );

        refundService = new OrderRefundService(
                orderMapper,
                orderStatusConsistencyLogger,
                orderValidationService,
                escrowService,
                orderLog,
                compensationPlanner,
                compensationPersistenceService,
                orderRefundPolicy,
                eventPublisher
        );

        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");

        order = new Order();
        order.setId(100L);
        order.setOrderNumber("ORD123");
        order.setUser(user);
        order.setStatus(OrderStatus.CONFIRMED);

        orderItem = new OrderItem();
        orderItem.setId(200L);
        orderItem.setOrder(order);
        order.setOrderItems(List.of(orderItem));
    }

    // --- OrderCancellationService Tests ---

    @Test
    void cancelOrder_ShouldSucceed_WhenValidCancellation() {
        OrderCancelRequest request = new OrderCancelRequest(List.of(200L), CancelRefundReason.CHANGED_MIND, "changed mind");
        
        OrderCancellationValidationService.ValidationResult validationResult = new OrderCancellationValidationService.ValidationResult(
                order, List.of(orderItem), Result.success()
        );
        when(cancellationValidationService.validate(any(Order.class), eq(request), eq(user))).thenReturn(validationResult);

        OrderItemCancel cancelRecord = OrderItemCancel.builder()
                .orderItem(orderItem)
                .cancelledQuantity(1)
                .refundAmount(BigDecimal.TEN)
                .build();
        OrderItemCompensationPlanner.CancellationPlan plan = new OrderItemCompensationPlanner.CancellationPlan(
                List.of(cancelRecord), BigDecimal.TEN
        );
        when(compensationPlanner.buildCancellationPlan(List.of(orderItem), request)).thenReturn(plan);

        when(escrowService.cancel(order, List.of(orderItem))).thenReturn(Result.success());
        when(compensationPersistenceService.reloadOrderWithItems(100L)).thenReturn(Result.success(order));
        when(compensationPlanner.areAllItemsCancelled(order)).thenReturn(true);
        when(compensationPersistenceService.saveOrderAndReload(order)).thenReturn(Result.success(order));

        OrderDto mockDto = new OrderDto();
        when(orderMapper.toDto(order)).thenReturn(mockDto);

        Result<OrderDto> result = cancellationService.cancelOrder(100L, request, user);

        assertTrue(result.isSuccess());
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(eventPublisher).publishEvent(any(OrderCancelledEvent.class));
        verify(orderLog).logOrderCancelled(eq("ORD123"), eq(false), eq("user@test.com"));
    }

    // --- OrderRefundService Tests ---

    @Test
    void refundOrder_ShouldSucceed_WhenValidRefund() {
        OrderRefundRequest request = new OrderRefundRequest(List.of(200L), CancelRefundReason.DEFECTIVE_PRODUCT, "defect");
        order.setStatus(OrderStatus.DELIVERED);

        when(orderValidationService.validateOwnership(100L, user)).thenReturn(Result.success(order));
        when(orderRefundPolicy.validateRefundable(order)).thenReturn(Result.success());
        when(compensationPlanner.resolveOrderItems(order, List.of(200L))).thenReturn(Result.success(List.of(orderItem)));
        when(compensationPlanner.validateRefundableItems(List.of(orderItem))).thenReturn(Result.success());

        OrderItemRefund refundRecord = OrderItemRefund.builder()
                .orderItem(orderItem)
                .refundedQuantity(1)
                .refundAmount(BigDecimal.TEN)
                .build();
        OrderItemCompensationPlanner.RefundPlan plan = new OrderItemCompensationPlanner.RefundPlan(
                List.of(refundRecord), BigDecimal.TEN
        );
        when(compensationPlanner.buildRefundPlan(List.of(orderItem), request)).thenReturn(plan);

        when(escrowService.refund(order, List.of(orderItem))).thenReturn(Result.success());
        when(compensationPersistenceService.reloadOrderWithItems(100L)).thenReturn(Result.success(order));
        when(compensationPlanner.areAllItemsRefunded(order)).thenReturn(true);
        when(compensationPersistenceService.saveOrderAndReload(order)).thenReturn(Result.success(order));

        OrderDto mockDto = new OrderDto();
        when(orderMapper.toDto(order)).thenReturn(mockDto);

        Result<OrderDto> result = refundService.refundOrder(100L, request, user);

        assertTrue(result.isSuccess());
        assertEquals(OrderStatus.REFUNDED, order.getStatus());
        verify(eventPublisher).publishEvent(any(OrderRefundedEvent.class));
        verify(orderLog).logOrderRefunded(eq("ORD123"), eq(BigDecimal.TEN), eq(false), eq("user@test.com"));
    }
}

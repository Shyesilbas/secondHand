package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.CancelRefundReason;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderItemCompensationPlannerTest {

    private OrderItemCompensationPlanner planner;

    private OrderItemRepository orderItemRepository;
    private OrderItemCancelRepository orderItemCancelRepository;
    private OrderItemRefundRepository orderItemRefundRepository;

    private Order order;
    private OrderItem item1;
    private OrderItem item2;

    @BeforeEach
    void setUp() {
        orderItemRepository = mock(OrderItemRepository.class);
        orderItemCancelRepository = mock(OrderItemCancelRepository.class);
        orderItemRefundRepository = mock(OrderItemRefundRepository.class);

        planner = new OrderItemCompensationPlanner(
                orderItemRepository,
                orderItemCancelRepository,
                orderItemRefundRepository
        );

        order = new Order();
        order.setId(100L);
        order.setTotalAmount(BigDecimal.valueOf(45)); // 45 TRY after discount (original price 50 TRY)

        item1 = new OrderItem();
        item1.setId(1L);
        item1.setOrder(order);
        item1.setQuantity(2);
        item1.setTotalPrice(BigDecimal.valueOf(20)); // item 1: 20 TRY original total

        item2 = new OrderItem();
        item2.setId(2L);
        item2.setOrder(order);
        item2.setQuantity(3);
        item2.setTotalPrice(BigDecimal.valueOf(30)); // item 2: 30 TRY original total

        order.setOrderItems(List.of(item1, item2));
    }

    @Test
    void resolveOrderItems_ShouldReturnAllOrderItems_WhenOrderItemIdsIsEmpty() {
        Result<List<OrderItem>> result = planner.resolveOrderItems(order, null);

        assertTrue(result.isSuccess());
        assertEquals(2, result.getData().size());
        assertTrue(result.getData().contains(item1));
        assertTrue(result.getData().contains(item2));
    }

    @Test
    void resolveOrderItems_ShouldReturnRequestedItems_WhenValidIdsProvided() {
        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item1));

        Result<List<OrderItem>> result = planner.resolveOrderItems(order, List.of(1L));

        assertTrue(result.isSuccess());
        assertEquals(1, result.getData().size());
        assertEquals(item1, result.getData().get(0));
    }

    @Test
    void resolveOrderItems_ShouldReturnError_WhenItemNotFound() {
        when(orderItemRepository.findById(99L)).thenReturn(Optional.empty());

        Result<List<OrderItem>> result = planner.resolveOrderItems(order, List.of(99L));

        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_ITEM_NOT_FOUND.getCode(), result.getErrorCode());
    }

    @Test
    void resolveOrderItems_ShouldReturnError_WhenItemDoesNotBelongToOrder() {
        Order differentOrder = new Order();
        differentOrder.setId(200L);
        OrderItem differentItem = new OrderItem();
        differentItem.setId(3L);
        differentItem.setOrder(differentOrder);

        when(orderItemRepository.findById(3L)).thenReturn(Optional.of(differentItem));

        Result<List<OrderItem>> result = planner.resolveOrderItems(order, List.of(3L));

        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_ITEM_NOT_BELONG_TO_ORDER.getCode(), result.getErrorCode());
    }

    @Test
    void validateCancellableItems_ShouldFail_WhenAlreadyCompensated() {
        when(orderItemCancelRepository.sumCancelledQuantityByOrderItem(item1)).thenReturn(2);
        when(orderItemRefundRepository.sumRefundedQuantityByOrderItem(item1)).thenReturn(0);

        Result<Void> result = planner.validateCancellableItems(List.of(item1));

        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_ITEM_ALREADY_CANCELLED.getCode(), result.getErrorCode());
    }

    @Test
    void buildCancellationPlan_ShouldComputeProportionalRefunds() {
        // Zero previously cancelled
        when(orderItemCancelRepository.sumCancelledQuantityByOrderItem(any(OrderItem.class))).thenReturn(0);
        when(orderItemRefundRepository.sumRefundedQuantityByOrderItem(any(OrderItem.class))).thenReturn(0);

        OrderCancelRequest request = new OrderCancelRequest(List.of(), CancelRefundReason.CHANGED_MIND, "Change of mind");
        OrderItemCompensationPlanner.CancellationPlan plan = planner.buildCancellationPlan(List.of(item1, item2), request);

        // Original total = 50. Total paid = 45 (Discount ratio 45/50 = 0.9).
        // item 1 refund amount = 20 * 0.9 = 18.00.
        // item 2 refund amount = 30 * 0.9 = 27.00.
        // Total refund = 45.00.
        assertEquals(new BigDecimal("45.00"), plan.totalRefundAmount());
        assertEquals(2, plan.records().size());
        assertEquals(new BigDecimal("18.00"), plan.records().get(0).getRefundAmount());
        assertEquals(new BigDecimal("27.00"), plan.records().get(1).getRefundAmount());
    }

    @Test
    void buildRefundPlan_ShouldComputeProportionalRefunds() {
        when(orderItemCancelRepository.sumCancelledQuantityByOrderItem(any(OrderItem.class))).thenReturn(0);
        when(orderItemRefundRepository.sumRefundedQuantityByOrderItem(any(OrderItem.class))).thenReturn(0);

        OrderRefundRequest request = new OrderRefundRequest(List.of(), CancelRefundReason.DEFECTIVE_PRODUCT, "Broken");
        OrderItemCompensationPlanner.RefundPlan plan = planner.buildRefundPlan(List.of(item1, item2), request);

        assertEquals(new BigDecimal("45.00"), plan.totalRefundAmount());
        assertEquals(2, plan.records().size());
        assertEquals(new BigDecimal("18.00"), plan.records().get(0).getRefundAmount());
        assertEquals(new BigDecimal("27.00"), plan.records().get(1).getRefundAmount());
    }
}

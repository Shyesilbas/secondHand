package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.shipping.entity.Shipping;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class OrderPolicyTest {

    private OrderCancellationPolicy cancellationPolicy;
    private OrderCompletionPolicy completionPolicy;
    private OrderRefundPolicy refundPolicy;
    private Order order;

    @BeforeEach
    void setUp() {
        cancellationPolicy = new OrderCancellationPolicy();
        completionPolicy = new OrderCompletionPolicy();
        refundPolicy = new OrderRefundPolicy();
        order = new Order();
    }

    // --- OrderCancellationPolicy Tests ---

    @Test
    void cancellationPolicy_ShouldSucceed_WhenOrderIsPending() {
        order.setStatus(OrderStatus.PENDING);
        Result<Void> result = cancellationPolicy.validateCancellable(order);
        assertTrue(result.isSuccess());
    }

    @Test
    void cancellationPolicy_ShouldSucceed_WhenOrderIsConfirmed() {
        order.setStatus(OrderStatus.CONFIRMED);
        Result<Void> result = cancellationPolicy.validateCancellable(order);
        assertTrue(result.isSuccess());
    }

    @Test
    void cancellationPolicy_ShouldFail_WhenOrderIsCompleted() {
        order.setStatus(OrderStatus.COMPLETED);
        Result<Void> result = cancellationPolicy.validateCancellable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_ALREADY_COMPLETED.getCode(), result.getErrorCode());
    }

    @Test
    void cancellationPolicy_ShouldFail_WhenOrderIsShipped() {
        order.setStatus(OrderStatus.SHIPPED);
        Result<Void> result = cancellationPolicy.validateCancellable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED.getCode(), result.getErrorCode());
    }

    // --- OrderCompletionPolicy Tests ---

    @Test
    void completionPolicy_ShouldFail_WhenOrderIsCompleted() {
        order.setStatus(OrderStatus.COMPLETED);
        Result<Void> result = completionPolicy.validateCompletable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_ALREADY_COMPLETED.getCode(), result.getErrorCode());
    }

    @Test
    void completionPolicy_ShouldSucceed_WhenOrderIsDelivered() {
        order.setStatus(OrderStatus.DELIVERED);
        Result<Void> result = completionPolicy.validateCompletable(order);
        assertTrue(result.isSuccess());
    }

    @Test
    void completionPolicy_ShouldSucceed_WhenOrderIsHandoverConfirmed() {
        order.setStatus(OrderStatus.HANDOVER_CONFIRMED);
        Result<Void> result = completionPolicy.validateCompletable(order);
        assertTrue(result.isSuccess());
    }

    @Test
    void completionPolicy_ShouldFail_WhenOrderIsPending() {
        order.setStatus(OrderStatus.PENDING);
        Result<Void> result = completionPolicy.validateCompletable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED.getCode(), result.getErrorCode());
    }

    // --- OrderRefundPolicy Tests ---

    @Test
    void refundPolicy_ShouldFail_WhenOrderIsCompleted() {
        order.setStatus(OrderStatus.COMPLETED);
        Result<Void> result = refundPolicy.validateRefundable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_ALREADY_COMPLETED.getCode(), result.getErrorCode());
    }

    @Test
    void refundPolicy_ShouldFail_WhenOrderIsNotRefundableStatus() {
        order.setStatus(OrderStatus.SHIPPED);
        Result<Void> result = refundPolicy.validateRefundable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED.getCode(), result.getErrorCode());
    }

    @Test
    void refundPolicy_ShouldFail_WhenShippingIsNull() {
        order.setStatus(OrderStatus.DELIVERED);
        order.setShipping(null);

        Result<Void> result = refundPolicy.validateRefundable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED.getCode(), result.getErrorCode());
    }

    @Test
    void refundPolicy_ShouldFail_WhenDeliveredAtIsNull() {
        order.setStatus(OrderStatus.DELIVERED);
        Shipping shipping = Shipping.builder().order(order).deliveredAt(null).build();
        order.setShipping(shipping);

        Result<Void> result = refundPolicy.validateRefundable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED.getCode(), result.getErrorCode());
    }

    @Test
    void refundPolicy_ShouldSucceed_WhenDeliveredWithin48Hours() {
        order.setStatus(OrderStatus.DELIVERED);
        Shipping shipping = Shipping.builder()
                .order(order)
                .deliveredAt(LocalDateTime.now().minusHours(24))
                .build();
        order.setShipping(shipping);

        Result<Void> result = refundPolicy.validateRefundable(order);
        assertTrue(result.isSuccess());
    }

    @Test
    void refundPolicy_ShouldFail_WhenDeliveredMoreThan48HoursAgo() {
        order.setStatus(OrderStatus.DELIVERED);
        Shipping shipping = Shipping.builder()
                .order(order)
                .deliveredAt(LocalDateTime.now().minusHours(49))
                .build();
        order.setShipping(shipping);

        Result<Void> result = refundPolicy.validateRefundable(order);
        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.REFUND_TIME_EXPIRED.getCode(), result.getErrorCode());
    }
}

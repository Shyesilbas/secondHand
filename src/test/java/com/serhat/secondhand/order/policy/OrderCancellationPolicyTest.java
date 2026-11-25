package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OrderCancellationPolicyTest {

    private final OrderCancellationPolicy policy = new OrderCancellationPolicy();

    @Test
    void lockedMeetupOrderCanBeCancelledByTheBuyer() {
        Order order = Order.builder().status(OrderStatus.VERIFICATION_LOCKED).build();

        assertThat(policy.validateCancellable(order).isSuccess()).isTrue();
    }

    @Test
    void confirmedHandoverCannotBeCancelled() {
        Order order = Order.builder().status(OrderStatus.HANDOVER_CONFIRMED).build();

        assertThat(policy.validateCancellable(order).isError()).isTrue();
    }
}

package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OrderShippingPolicyTest {

    private final OrderShippingPolicy policy = new OrderShippingPolicy();

    @Test
    void confirmedAndProcessing_areShippable() {
        assertThat(policy.validateShippable(order(OrderStatus.CONFIRMED), 10L).isSuccess()).isTrue();
        assertThat(policy.validateShippable(order(OrderStatus.PROCESSING), 10L).isSuccess()).isTrue();
    }

    @Test
    void alreadyShippedOrCancelled_isRejectedWithErrorCode() {
        assertThat(policy.validateShippable(order(OrderStatus.SHIPPED), 10L).getErrorCode())
                .isEqualTo(OrderErrorCodes.ORDER_NOT_SHIPPABLE.getCode());
        assertThat(policy.validateShippable(order(OrderStatus.CANCELLED), 10L).getErrorCode())
                .isEqualTo(OrderErrorCodes.ORDER_NOT_SHIPPABLE.getCode());
    }

    @Test
    void otherSeller_isRejected() {
        assertThat(policy.validateShippable(order(OrderStatus.CONFIRMED), 99L).getErrorCode())
                .isEqualTo(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER.getCode());
    }

    private static Order order(OrderStatus status) {
        return Order.builder()
                .status(status)
                .deliveryMethod(DeliveryMethod.CARGO)
                .shipping(new Shipping())
                .orderItems(new ArrayList<>(List.of(OrderItem.builder().seller(User.builder().id(10L).build()).build())))
                .build();
    }
}

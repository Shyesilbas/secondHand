package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.util.OrderErrorCodes;

import java.util.Set;

public final class OrderPolicyGuards {

    private OrderPolicyGuards() {
    }

    public static Result<Void> validateNotCompletedAndInAllowedStatuses(
            Order order,
            Set<Order.OrderStatus> allowedStatuses,
            OrderErrorCodes invalidTransitionError
    ) {
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (!allowedStatuses.contains(order.getStatus())) {
            return Result.error(invalidTransitionError);
        }
        return Result.success();
    }
}

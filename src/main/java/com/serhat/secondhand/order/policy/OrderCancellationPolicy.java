package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import org.springframework.stereotype.Component;

@Component
public class OrderCancellationPolicy {

    public Result<Void> validateCancellable(Order order) {
        return OrderPolicyGuards.validateNotCompletedAndInAllowedStatuses(
                order,
                Order.OrderStatus.CANCELLABLE_STATUSES,
                OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED
        );
    }
}

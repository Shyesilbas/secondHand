package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import org.springframework.stereotype.Component;

@Component
public class OrderCompletionPolicy {

    public Result<Void> validateCompletable(Order order) {
        return OrderPolicyGuards.validateNotCompletedAndInAllowedStatuses(
                order,
                Order.OrderStatus.COMPLETABLE_STATUSES,
                OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED
        );
    }
}

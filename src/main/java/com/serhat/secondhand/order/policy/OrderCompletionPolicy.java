package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import org.springframework.stereotype.Component;

@Component
public class OrderCompletionPolicy {

    public Result<Void> validateCompletable(Order order) {
        if (order.getStatus() == com.serhat.secondhand.order.entity.enums.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (!order.getStatus().isCompletable()) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED);
        }
        return Result.success();
    }
}

package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import org.springframework.stereotype.Component;

@Component
public class OrderCompletionPolicy {

    public Result<Void> validateCompletable(Order order) {
        if (order.getStatus() == OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (!order.getStatus().isCompletable()) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED);
        }
        return Result.success();
    }

    /**
     * Safe Meetup manual completion: allowed after the code handshake ({@code HANDOVER_CONFIRMED}),
     * or by the buyer alone while the meetup is still pending.
     */
    public Result<Void> validateHandoverConfirmable(Order order, boolean isBuyer) {
        OrderStatus status = order.getStatus();
        if (status != OrderStatus.HANDOVER_CONFIRMED && status != OrderStatus.MEETUP_PENDING) {
            return Result.error("Order handover is not confirmed yet", OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED.getCode());
        }
        if (status == OrderStatus.MEETUP_PENDING && !isBuyer) {
            return Result.error("Only the buyer can manually complete a pending meetup order without code verification",
                    OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED.getCode());
        }
        return Result.success();
    }
}

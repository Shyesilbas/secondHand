package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.shipping.entity.Shipping;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class OrderRefundPolicy {

    public Result<Void> validateRefundable(Order order) {
        if (order.getStatus() == OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (!order.getStatus().isRefundable()) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }

        if (order.getShipping() == null || order.getShipping().getDeliveredAt() == null) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(order.getShipping().getDeliveredAt(), now);
        long hoursPassed = duration.toHours();

        if (hoursPassed >= OrderBusinessConstants.REFUND_WINDOW_HOURS) {
            return Result.error(OrderErrorCodes.REFUND_TIME_EXPIRED);
        }
        return Result.success();
    }
}

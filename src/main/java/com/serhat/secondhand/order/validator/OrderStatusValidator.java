package com.serhat.secondhand.order.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class OrderStatusValidator {

    public Result<Void> validateStatusConsistency(Order order) {
        Order.OrderStatus orderStatus = order.getStatus();
        ShippingStatus shippingStatus = order.getShipping() != null ? order.getShipping().getStatus() : null;

        if (orderStatus == Order.OrderStatus.DELIVERED || orderStatus == Order.OrderStatus.COMPLETED) {
            if (shippingStatus != ShippingStatus.DELIVERED && shippingStatus != null) {
                log.warn("Order status is {} but shipping status is {}. This should not happen.", orderStatus, shippingStatus);
            }
        }

        if (orderStatus == Order.OrderStatus.CANCELLED) {
            if (shippingStatus != null && shippingStatus != ShippingStatus.CANCELLED && 
                shippingStatus != ShippingStatus.PENDING && shippingStatus != ShippingStatus.IN_TRANSIT) {
            }
        }
        return Result.success();
    }

    public Result<Void> validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus) {
        if (currentStatus == Order.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }

        if (currentStatus == Order.OrderStatus.CANCELLED && newStatus != Order.OrderStatus.CANCELLED) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED);
        }

        if (currentStatus == Order.OrderStatus.REFUNDED && newStatus != Order.OrderStatus.REFUNDED) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }
        return Result.success();
    }
}


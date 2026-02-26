package com.serhat.secondhand.order.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.service.OrderLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class OrderStatusValidator {

    private final OrderLogService orderLog;

    /**
     * Terminal statuses — orders in these states cannot transition to any other state.
     */
    private static final Set<Order.OrderStatus> TERMINAL_STATUSES =
            EnumSet.of(Order.OrderStatus.COMPLETED, Order.OrderStatus.CANCELLED, Order.OrderStatus.REFUNDED);

    public Result<Void> validateStatusConsistency(Order order) {
        Order.OrderStatus orderStatus = order.getStatus();
        ShippingStatus shippingStatus = order.getShipping() != null ? order.getShipping().getStatus() : null;

        if (orderStatus == Order.OrderStatus.DELIVERED || orderStatus == Order.OrderStatus.COMPLETED) {
            if (shippingStatus != ShippingStatus.DELIVERED && shippingStatus != null) {
                orderLog.logStatusInconsistency(orderStatus.name(), shippingStatus.name());
            }
        }

        if (orderStatus == Order.OrderStatus.CANCELLED) {
            if (shippingStatus != null && shippingStatus != ShippingStatus.CANCELLED &&
                shippingStatus != ShippingStatus.PENDING && shippingStatus != ShippingStatus.IN_TRANSIT) {
                orderLog.logStatusInconsistency(orderStatus.name(), shippingStatus.name());
            }
        }
        return Result.success();
    }
}


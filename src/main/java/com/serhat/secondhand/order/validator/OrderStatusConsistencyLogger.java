package com.serhat.secondhand.order.validator;

import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Logs order/shipping status inconsistencies for monitoring purposes.
 * Does NOT block business operations — inconsistencies are warnings, not hard failures.
 * For business-rule validation, see {@link com.serhat.secondhand.order.policy}.
 */
@Component
@RequiredArgsConstructor
public class OrderStatusConsistencyLogger {

    private final OrderLogService orderLog;

    public void logIfInconsistent(Order order) {
        OrderStatus orderStatus = order.getStatus();
        ShippingStatus shippingStatus = order.getShipping() != null ? order.getShipping().getStatus() : null;

        if (orderStatus == OrderStatus.DELIVERED || orderStatus == OrderStatus.COMPLETED) {
            if (shippingStatus != ShippingStatus.DELIVERED && shippingStatus != null) {
                orderLog.logStatusInconsistency(orderStatus.name(), shippingStatus.name());
            }
        }

        if (orderStatus == OrderStatus.CANCELLED) {
            if (shippingStatus != null
                    && shippingStatus != ShippingStatus.CANCELLED
                    && shippingStatus != ShippingStatus.PENDING
                    && shippingStatus != ShippingStatus.IN_TRANSIT) {
                orderLog.logStatusInconsistency(orderStatus.name(), shippingStatus.name());
            }
        }
    }
}

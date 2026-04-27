package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import org.springframework.stereotype.Component;

@Component
public class OrderStateTransitionPolicy {

    public void applyCompletion(Order order) {
        order.setStatus(Order.OrderStatus.COMPLETED);
        if (order.getShipping() != null && order.getShipping().getStatus() != ShippingStatus.DELIVERED) {
            order.getShipping().setStatus(ShippingStatus.DELIVERED);
        }
    }

    public void applyCancellation(Order order, boolean allItemsCancelled) {
        if (allItemsCancelled) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            if (order.getShipping() != null && order.getShipping().getStatus() != ShippingStatus.DELIVERED) {
                order.getShipping().setStatus(ShippingStatus.CANCELLED);
            }
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            return;
        }
        order.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
    }

    public void applyRefund(Order order, boolean allItemsRefunded) {
        if (allItemsRefunded) {
            order.setStatus(Order.OrderStatus.REFUNDED);
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            return;
        }
        order.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
    }
}

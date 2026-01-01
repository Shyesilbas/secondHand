package com.serhat.secondhand.payment.mapper;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderPaymentMapper {

    public List<PaymentRequest> buildPaymentRequests(User user, List<Cart> cartItems, 
                                                    CheckoutRequest request, PricingResultDto pricing,
                                                    PaymentRequestMapper paymentRequestMapper) {
        return paymentRequestMapper.buildOrderPaymentRequests(user, cartItems, request, pricing);
    }

    public void updateOrderPaymentStatus(Order order, List<PaymentDto> paymentResults, 
                                       boolean allSuccessful, PaymentType paymentType) {
        if (paymentResults != null && !paymentResults.isEmpty()) {
            order.setPaymentReference(paymentResults.get(0).paymentId().toString());
        }
        order.setPaymentStatus(allSuccessful ? Order.PaymentStatus.PAID : Order.PaymentStatus.FAILED);
        order.setStatus(allSuccessful ? Order.OrderStatus.CONFIRMED : Order.OrderStatus.CANCELLED);
        order.setPaymentMethod(paymentType != null ? paymentType : PaymentType.EWALLET);
        if (allSuccessful && order.getShipping() != null) {
            order.getShipping().setStatus(com.serhat.secondhand.order.entity.enums.ShippingStatus.PENDING);
        }
    }

    public void markOrderAsFailed(Order order) {
        order.setPaymentStatus(Order.PaymentStatus.FAILED);
        order.setStatus(Order.OrderStatus.CANCELLED);
    }
}


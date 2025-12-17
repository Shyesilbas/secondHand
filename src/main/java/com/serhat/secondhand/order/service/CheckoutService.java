package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CheckoutService {

    private final CartRepository cartRepository;
    private final OrderCreationService orderCreationService;
    private final OrderPaymentService orderPaymentService;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;

    public OrderDto checkout(User user, CheckoutRequest request) {
        log.info("Processing checkout for user: {}", user.getEmail());

        var cartItems = cartRepository.findByUserWithListing(user);

        Order order = orderCreationService.createOrder(user, cartItems, request);

        var paymentResult = orderPaymentService.processOrderPayments(user, cartItems, request, order);

        orderNotificationService.sendOrderNotifications(user, order, paymentResult.allSuccessful());

        if (paymentResult.allSuccessful()) {
            cartRepository.deleteByUser(user);
            log.info("Checkout completed successfully for order: {} with {} payments",
                    order.getOrderNumber(), paymentResult.paymentResults().size());
        } else {
            log.warn("Checkout completed with failed payments for order: {}", order.getOrderNumber());
        }

        return orderMapper.toDto(order);
    }
}

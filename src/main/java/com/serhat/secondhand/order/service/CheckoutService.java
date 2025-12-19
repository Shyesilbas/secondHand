package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
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
    private final PricingService pricingService;
    private final CouponService couponService;

    public OrderDto checkout(User user, CheckoutRequest request) {
        log.info("Processing checkout for user: {}", user.getEmail());

        var cartItems = cartRepository.findByUserWithListing(user);

        PricingResultDto pricing = pricingService.priceCart(user, cartItems, request.getCouponCode());
        Order order = orderCreationService.createOrder(user, cartItems, request, pricing);

        var paymentResult = orderPaymentService.processOrderPayments(user, cartItems, request, order, pricing);

        orderNotificationService.sendOrderNotifications(user, order, paymentResult.allSuccessful());

        if (paymentResult.allSuccessful()) {
            if (pricing.getCouponCode() != null) {
                couponService.redeem(pricing.getCouponCode(), user, order);
            }
            cartRepository.deleteByUser(user);
            log.info("Checkout completed successfully for order: {} with {} payments",
                    order.getOrderNumber(), paymentResult.paymentResults().size());
        } else {
            log.warn("Checkout completed with failed payments for order: {}", order.getOrderNumber());
        }

        return orderMapper.toDto(order);
    }
}

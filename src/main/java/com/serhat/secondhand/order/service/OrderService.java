package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.shipping.ShippingService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.serhat.secondhand.order.util.OrderErrorCodes;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderMapper orderMapper;
    private final ShippingService shippingService;
    
    private final OrderCreationService orderCreationService;
    private final OrderPaymentService orderPaymentService;
    private final OrderNotificationService orderNotificationService;


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

        @Transactional(readOnly = true)
    public Page<OrderDto> getUserOrders(User user, Pageable pageable) {
        log.info("Getting orders for user: {}", user.getEmail());
        
        Page<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        shippingService.updateShippingStatusesForOrders(orders.getContent());

        return orders.map(orderMapper::toDto);
    }

        @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, User user) {
        Order order = findOrderByIdAndValidateOwnership(orderId, user);
        shippingService.calculateShippingStatus(order);
        
        return orderMapper.toDto(order);
    }

        @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(String orderNumber, User user) {
        Order order = findOrderByNumberAndValidateOwnership(orderNumber, user);
        shippingService.calculateShippingStatus(order);
        
        return orderMapper.toDto(order);
    }

        public OrderDto cancelOrder(Long orderId, User user) {
        Order order = findOrderByIdAndValidateOwnership(orderId, user);
        
        validateOrderCanBeCancelled(order);
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        
                orderNotificationService.sendOrderCancellationNotification(user, savedOrder);
        
        log.info("Order cancelled: {}", order.getOrderNumber());
        return orderMapper.toDto(savedOrder);
    }

        private Order findOrderByIdAndValidateOwnership(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
        
        return order;
    }

        private Order findOrderByNumberAndValidateOwnership(String orderNumber, User user) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
        
        return order;
    }

        private void validateOrderCanBeCancelled(Order order) {
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new BusinessException(OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED);
        }
    }
}
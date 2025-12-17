package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.shipping.ShippingService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ShippingService shippingService;

    public Page<OrderDto> getUserOrders(User user, Pageable pageable) {
        log.info("Getting orders for user: {}", user.getEmail());

        Page<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        shippingService.updateShippingStatusesForOrders(orders.getContent());

        return orders.map(orderMapper::toDto);
    }

    public OrderDto getOrderById(Long orderId, User user) {
        Order order = findOrderByIdAndValidateOwnership(orderId, user);
        shippingService.calculateShippingStatus(order);

        return orderMapper.toDto(order);
    }

    public OrderDto getOrderByOrderNumber(String orderNumber, User user) {
        Order order = findOrderByNumberAndValidateOwnership(orderNumber, user);
        shippingService.calculateShippingStatus(order);

        return orderMapper.toDto(order);
    }

    private Order findOrderByIdAndValidateOwnership(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        validateOwnership(order, user);
        return order;
    }

    private Order findOrderByNumberAndValidateOwnership(String orderNumber, User user) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        validateOwnership(order, user);
        return order;
    }

    private void validateOwnership(Order order, User user) {
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
    }
}

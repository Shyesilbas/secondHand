package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderNameService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public OrderDto updateOrderName(Long orderId, String name, User user) {
        Order order = findOrderByIdAndValidateOwnership(orderId, user);

        if (name != null && name.length() > 100) {
            throw new BusinessException(OrderErrorCodes.INVALID_ORDER_NAME);
        }

        order.setName(name);
        Order savedOrder = orderRepository.save(order);

        log.info("Order name updated: {} for order: {}", name, order.getOrderNumber());
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
}


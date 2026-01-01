package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusValidator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderCompletionService {

    private final OrderRepository orderRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final OrderStatusValidator orderStatusValidator;

    public OrderDto completeOrder(Long orderId, User user) {
        Order order = findOrderByIdAndValidateOwnership(orderId, user);

        validateOrderCanBeCompleted(order);
        orderStatusValidator.validateStatusConsistency(order);

        order.setStatus(Order.OrderStatus.COMPLETED);
        if (order.getShipping() != null && order.getShipping().getStatus() != ShippingStatus.DELIVERED) {
            order.getShipping().setStatus(ShippingStatus.DELIVERED);
        }
        Order savedOrder = orderRepository.save(order);

        orderNotificationService.sendOrderCompletionNotification(user, savedOrder, false);

        log.info("Order completed manually: {}", order.getOrderNumber());
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

    private void validateOrderCanBeCompleted(Order order) {
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new BusinessException(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new BusinessException(OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED);
        }
    }
}


package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderNameService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final IOrderValidationService orderValidationService;
    private final OrderLogService orderLog;

    public Result<OrderDto> updateOrderName(Long orderId, String name, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        if (name != null && name.length() > 100) {
            return Result.error(OrderErrorCodes.INVALID_ORDER_NAME);
        }

        order.setName(name);
        Order savedOrder = orderRepository.save(order);

        orderLog.logOrderModified(order.getOrderNumber(), "name");
        return Result.success(orderMapper.toDto(savedOrder));
    }

}


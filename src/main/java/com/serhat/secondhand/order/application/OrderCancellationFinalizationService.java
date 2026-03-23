package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCancellationFinalizationService {

    private final OrderRepository orderRepository;
    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;
    private final OrderNotificationService orderNotificationService;
    private final OrderLogService orderLog;
    private final OrderMapper orderMapper;

    public OrderCancellationDto finalize(Order order, User user) {
        boolean allItemsCancelled = compensationPlanner.areAllItemsCancelled(order);
        orderStateTransitionPolicy.applyCancellation(order, allItemsCancelled);

        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();

        Result<OrderDto> result = orderRepository.findByIdWithOrderItems(savedOrder.getId())
                .map(finalOrder -> {
                    orderNotificationService.sendOrderCancellationNotification(user, finalOrder);
                    orderLog.logOrderCancelled(order.getOrderNumber(), !allItemsCancelled, user.getEmail());
                    return Result.success(orderMapper.toDto(finalOrder));
                })
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));

        return new OrderCancellationDto(result);
    }
}


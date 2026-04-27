package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.policy.OrderCompletionPolicy;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusConsistencyLogger;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderCompletionService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderStatusConsistencyLogger orderStatusConsistencyLogger;
    private final EscrowService escrowService;
    private final OrderValidationService orderValidationService;
    private final OrderLogService orderLog;
    private final OrderCompletionPolicy orderCompletionPolicy;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;
    private final ApplicationEventPublisher eventPublisher;

    @CacheEvict(value = "pendingOrders", key = "#user.id")
    public Result<OrderDto> completeOrder(Long orderId, User user) {
        Result<Order> orderResult = validateOrderForCompletion(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> releaseResult = releaseEscrowsForOrder(order);
        if (releaseResult.isError()) return escrowReleaseFailed();

        orderStateTransitionPolicy.applyCompletion(order);
        Order savedOrder = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderCompletedEvent(savedOrder, user, false));

        orderLog.logOrderCompleted(order.getOrderNumber(), false);
        return Result.success(orderMapper.toDto(savedOrder));
    }

    private Result<Order> validateOrderForCompletion(Long orderId, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult;

        Order order = orderResult.getData();

        Result<Void> completionValidationResult = orderCompletionPolicy.validateCompletable(order);
        if (completionValidationResult.isError()) return completionValidationResult.propagateError();

        orderStatusConsistencyLogger.logIfInconsistent(order);

        return Result.success(order);
    }

    private Result<OrderDto> escrowReleaseFailed() {
        return Result.error(
                "Order completion failed during escrow release",
                OrderErrorCodes.ORDER_COMPLETION_ESCROW_RELEASE_FAILED.getCode()
        );
    }

    private Result<Void> releaseEscrowsForOrder(Order order) {
        Result<Void> orchestratorResult = escrowService.release(order);
        
        if (orchestratorResult.isError()) {
            orderLog.logEscrowReleaseFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error(orchestratorResult.getMessage(), orchestratorResult.getErrorCode());
        } else {
            orderLog.logEscrowReleased(1, order.getOrderNumber()); // We can improve the count later
            return Result.success();
        }
    }
}


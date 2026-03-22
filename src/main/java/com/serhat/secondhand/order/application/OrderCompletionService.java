package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderCompletionPolicy;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.validator.OrderStatusValidator;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderCompletionService {

    private final OrderRepository orderRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderEscrowService orderEscrowService;
    private final IOrderValidationService orderValidationService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderLogService orderLog;
    private final OrderCompletionPolicy orderCompletionPolicy;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;

    @CacheEvict(value = "pendingOrders", key = "#user.id")
    public Result<OrderDto> completeOrder(Long orderId, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> completionValidationResult = orderCompletionPolicy.validateCompletable(order);
        if (completionValidationResult.isError()) return completionValidationResult.propagateError();

        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) return consistencyResult.propagateError();

        Result<Void> releaseResult = releaseEscrowsForOrder(order);
        if (releaseResult.isError()) {
            return Result.error("Order completion failed during escrow release", "ORDER_COMPLETION_ESCROW_RELEASE_FAILED");
        }

        orderStateTransitionPolicy.applyCompletion(order);
        Order savedOrder = orderRepository.save(order);

        orderNotificationService.sendOrderCompletionNotification(user, savedOrder, false);

        orderLog.logOrderCompleted(order.getOrderNumber(), false);
        return Result.success(orderMapper.toDto(savedOrder));
    }

    private Result<Void> releaseEscrowsForOrder(Order order) {
        List<OrderItemEscrow> pendingEscrows = orderEscrowService.findPendingEscrowsByOrder(order);
        
        if (pendingEscrows.isEmpty()) {
            return Result.success();
        }

        Result<Void> orchestratorResult = paymentOrchestrator.releaseEscrowsToSellers(pendingEscrows);
        
        if (orchestratorResult.isError()) {
            orderLog.logEscrowReleaseFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error(orchestratorResult.getMessage(), orchestratorResult.getErrorCode());
        } else {
            orderLog.logEscrowReleased(pendingEscrows.size(), order.getOrderNumber());
            return Result.success();
        }
    }
}


package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
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

    @CacheEvict(value = "pendingOrders", key = "#user.id")
    public Result<OrderDto> completeOrder(Long orderId, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> completionValidationResult = validateOrderCanBeCompleted(order);
        if (completionValidationResult.isError()) return completionValidationResult.propagateError();

        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) return consistencyResult.propagateError();

        order.setStatus(Order.OrderStatus.COMPLETED);
        if (order.getShipping() != null && order.getShipping().getStatus() != ShippingStatus.DELIVERED) {
            order.getShipping().setStatus(ShippingStatus.DELIVERED);
        }
        Order savedOrder = orderRepository.save(order);

        releaseEscrowsForOrder(savedOrder);

        orderNotificationService.sendOrderCompletionNotification(user, savedOrder, false);

        orderLog.logOrderCompleted(order.getOrderNumber(), false);
        return Result.success(orderMapper.toDto(savedOrder));
    }


    private Result<Void> validateOrderCanBeCompleted(Order order) {
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (!Order.OrderStatus.COMPLETABLE_STATUSES.contains(order.getStatus())) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_COMPLETED);
        }
        return Result.success();
    }

    private void releaseEscrowsForOrder(Order order) {
        List<OrderItemEscrow> pendingEscrows = orderEscrowService.findPendingEscrowsByOrder(order);
        
        if (pendingEscrows.isEmpty()) {
            return;
        }

        Result<Void> orchestratorResult = paymentOrchestrator.releaseEscrowsToSellers(pendingEscrows);
        
        if (orchestratorResult.isError()) {
            orderLog.logEscrowReleaseFailed(order.getOrderNumber(), orchestratorResult.getMessage());
        } else {
            orderLog.logEscrowReleased(pendingEscrows.size(), order.getOrderNumber());
        }
    }
}


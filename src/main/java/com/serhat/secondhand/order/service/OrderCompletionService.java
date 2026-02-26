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
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderCompletionService {

    private final OrderRepository orderRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderEscrowService orderEscrowService;
    private final IOrderValidationService orderValidationService;
    private final PaymentOrchestrator paymentOrchestrator;

    @CacheEvict(value = "pendingOrders", key = "#user.id")
    public Result<OrderDto> completeOrder(Long orderId, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) {
            return Result.error(orderResult.getMessage(), orderResult.getErrorCode());
        }

        Order order = orderResult.getData();

        Result<Void> completionValidationResult = validateOrderCanBeCompleted(order);
        if (completionValidationResult.isError()) {
            return Result.error(completionValidationResult.getMessage(), completionValidationResult.getErrorCode());
        }
        
        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) {
            return Result.error(consistencyResult.getMessage(), consistencyResult.getErrorCode());
        }

        order.setStatus(Order.OrderStatus.COMPLETED);
        if (order.getShipping() != null && order.getShipping().getStatus() != ShippingStatus.DELIVERED) {
            order.getShipping().setStatus(ShippingStatus.DELIVERED);
        }
        Order savedOrder = orderRepository.save(order);

        releaseEscrowsForOrder(savedOrder);

        orderNotificationService.sendOrderCompletionNotification(user, savedOrder, false);

        log.info("Order completed manually: {}", order.getOrderNumber());
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
            log.info("No pending escrows to release for order {}", order.getOrderNumber());
            return;
        }

        Result<Void> orchestratorResult = paymentOrchestrator.releaseEscrowsToSellers(pendingEscrows);
        
        if (orchestratorResult.isError()) {
            log.error("Failed to release escrows for order {}: {}", 
                    order.getOrderNumber(), orchestratorResult.getMessage());
        } else {
            log.info("Successfully released {} escrow(s) for order {}", 
                    pendingEscrows.size(), order.getOrderNumber());
        }
    }
}


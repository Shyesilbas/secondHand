package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.application.event.OrderCancelledEvent;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderCancellationService {

    private static final String REFUND_FAILED_MESSAGE = "Failed to process refund. Please contact support.";

    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderCancellationValidationService validationService;
    private final OrderCompensationPersistenceService compensationPersistenceService;
    private final EscrowService escrowService;
    private final OrderLogService orderLog;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;
    private final OrderMapper orderMapper;
    private final ApplicationEventPublisher eventPublisher;

    public Result<OrderDto> cancelOrder(Long orderId, OrderCancelRequest request, User user) {
        Order orderStub = new Order();
        orderStub.setId(orderId);

        OrderCancellationValidationService.ValidationResult validation = validationService.validate(orderStub, request, user);
        if (validation.validationResult().isError()) {
            return validation.validationResult().propagateError();
        }

        Order order = validation.validatedOrder();
        List<OrderItem> itemsToCancel = validation.cancellableItems();

        OrderItemCompensationPlanner.CancellationPlan cancellationPlan =
                compensationPlanner.buildCancellationPlan(itemsToCancel, request);
        BigDecimal totalRefundAmount = cancellationPlan.totalRefundAmount();
        List<OrderItemCancel> cancelRecords = cancellationPlan.records();

        if (cancelRecords.isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_CANCELLED);
        }

        compensationPersistenceService.persistCancellationRecordsAndRestoreStock(cancelRecords);

        Result<Void> refundResult = processRefund(cancelRecords, totalRefundAmount, order);
        if (refundResult.isError()) {
            return refundResult.propagateError();
        }

        Result<Order> reloadedOrderResult = compensationPersistenceService.reloadOrderWithItems(order.getId());
        if (reloadedOrderResult.isError()) {
            return reloadedOrderResult.propagateError();
        }

        return finalizeCancellation(reloadedOrderResult.getData(), user);
    }

    private Result<Void> processRefund(List<OrderItemCancel> cancelRecords, BigDecimal totalRefundAmount, Order order) {
        User buyer = order.getUser();
        List<OrderItem> itemsToCancel = cancelRecords.stream().map(OrderItemCancel::getOrderItem).toList();

        Result<Void> orchestratorResult = escrowService.cancel(order, itemsToCancel);
        if (orchestratorResult.isError()) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            orderLog.logEscrowCancelFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error(REFUND_FAILED_MESSAGE, OrderErrorCodes.REFUND_FAILED.getCode());
        }

        orderLog.logRefundProcessed(totalRefundAmount, buyer.getEmail(), order.getOrderNumber());
        return Result.success();
    }

    private Result<OrderDto> finalizeCancellation(Order order, User user) {
        boolean allItemsCancelled = compensationPlanner.areAllItemsCancelled(order);
        orderStateTransitionPolicy.applyCancellation(order, allItemsCancelled);

        Result<Order> savedOrderResult = compensationPersistenceService.saveOrderAndReload(order);
        if (savedOrderResult.isError()) {
            return savedOrderResult.propagateError();
        }

        Order finalOrder = savedOrderResult.getData();
        eventPublisher.publishEvent(new OrderCancelledEvent(finalOrder, user));
        orderLog.logOrderCancelled(order.getOrderNumber(), !allItemsCancelled, user.getEmail());
        return Result.success(orderMapper.toDto(finalOrder));
    }
}

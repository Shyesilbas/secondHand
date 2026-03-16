package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderCancellationPolicy;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusValidator;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderCancellationService {

    private final OrderRepository orderRepository;
    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderEscrowService orderEscrowService;
    private final IOrderValidationService orderValidationService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderItemHelper orderItemHelper;
    private final OrderStockService orderStockService;
    private final OrderLogService orderLog;
    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderCancellationPolicy orderCancellationPolicy;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;

    public Result<OrderDto> cancelOrder(Long orderId, OrderCancelRequest request, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> cancelValidationResult = orderCancellationPolicy.validateCancellable(order);
        if (cancelValidationResult.isError()) return cancelValidationResult.propagateError();

        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) return consistencyResult.propagateError();

        Result<List<OrderItem>> itemsResult = orderItemHelper.resolveOrderItems(order, request.getOrderItemIds());
        if (itemsResult.isError()) return itemsResult.propagateError();

        List<OrderItem> itemsToCancel = itemsResult.getData();
        Result<Void> itemsValidationResult = compensationPlanner.validateCancellableItems(itemsToCancel);
        if (itemsValidationResult.isError()) return itemsValidationResult.propagateError();

        OrderItemCompensationPlanner.CancellationPlan cancellationPlan =
                compensationPlanner.buildCancellationPlan(itemsToCancel, request);
        BigDecimal totalRefundAmount = cancellationPlan.totalRefundAmount();
        List<OrderItemCancel> cancelRecords = cancellationPlan.records();

        if (cancelRecords.isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_CANCELLED);
        }

        orderItemCancelRepository.saveAll(cancelRecords);
        cancelRecords.forEach(record ->
                orderStockService.restoreStock(record.getOrderItem(), record.getCancelledQuantity()));
        orderRepository.flush();

        List<OrderItemEscrow> escrowsToCancel = itemsToCancel.stream()
                .map(item -> orderEscrowService.findEscrowByOrderItem(item))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();

        Result<Void> orchestratorResult = paymentOrchestrator.cancelEscrowsAndRefundBuyer(escrowsToCancel, user);
        if (orchestratorResult.isError()) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            orderLog.logEscrowCancelFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error("Failed to process refund. Please contact support.", "REFUND_FAILED");
        }

        orderLog.logRefundProcessed(totalRefundAmount, user.getEmail(), order.getOrderNumber());

        return orderRepository.findByIdWithOrderItems(order.getId())
                .map(refreshedOrder -> processCancellationStatus(refreshedOrder, user))
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }
    
    private Result<OrderDto> processCancellationStatus(Order order, User user) {
        boolean allItemsCancelled = compensationPlanner.areAllItemsCancelled(order);
        orderStateTransitionPolicy.applyCancellation(order, allItemsCancelled);

        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();
        
        return orderRepository.findByIdWithOrderItems(savedOrder.getId())
                .map(finalOrder -> {
                    orderNotificationService.sendOrderCancellationNotification(user, finalOrder);
                    orderLog.logOrderCancelled(order.getOrderNumber(), !allItemsCancelled, user.getEmail());
                    return Result.success(orderMapper.toDto(finalOrder));
                })
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }

}

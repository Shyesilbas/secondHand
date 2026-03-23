package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCancellationExecutionService {

    private static final String REFUND_FAILED_MESSAGE = "Failed to process refund. Please contact support.";

    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderStockService orderStockService;
    private final OrderRepository orderRepository;

    private final OrderEscrowService orderEscrowService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderLogService orderLog;

    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;

    public Result<OrderDto> executeCancellation(
            List<OrderItemCancel> cancelRecords,
            BigDecimal totalRefundAmount,
            Order order,
            User user
    ) {
        persistCancelRecords(cancelRecords);
        Result<Void> refundResult = processRefund(cancelRecords, totalRefundAmount, order);
        if (refundResult.isError()) {
            return refundResult.propagateError();
        }

        return orderRepository.findByIdWithOrderItems(order.getId())
                .map(refreshedOrder -> finalizeCancellation(refreshedOrder, user))
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }

    private void persistCancelRecords(List<OrderItemCancel> cancelRecords) {
        orderItemCancelRepository.saveAll(cancelRecords);
        cancelRecords.forEach(record ->
                orderStockService.restoreStock(record.getOrderItem(), record.getCancelledQuantity()));
        orderRepository.flush();
    }

    private Result<Void> processRefund(List<OrderItemCancel> cancelRecords, BigDecimal totalRefundAmount, Order order) {
        User buyer = order.getUser();

        List<OrderItemEscrow> escrowsToCancel = orderEscrowService.findExistingEscrowsByOrderItems(
                cancelRecords.stream().map(OrderItemCancel::getOrderItem).toList());

        Result<Void> orchestratorResult = paymentOrchestrator.cancelEscrowsAndRefundBuyer(escrowsToCancel, buyer);
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


package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderRefundPolicy;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
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

@Service
@RequiredArgsConstructor
@Transactional
public class OrderRefundService {

    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final OrderStatusValidator orderStatusValidator;
    private final IOrderValidationService orderValidationService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderItemHelper orderItemHelper;
    private final OrderLogService orderLog;
    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderRefundWorkflowSupport orderRefundWorkflowSupport;
    private final OrderRefundPolicy orderRefundPolicy;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;

    public Result<OrderDto> refundOrder(Long orderId, OrderRefundRequest request, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> refundValidationResult = orderRefundPolicy.validateRefundable(order);
        if (refundValidationResult.isError()) return refundValidationResult.propagateError();

        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) return consistencyResult.propagateError();

        Result<List<OrderItem>> itemsResult = orderItemHelper.resolveOrderItems(order, request.getOrderItemIds());
        if (itemsResult.isError()) return itemsResult.propagateError();

        List<OrderItem> itemsToRefund = itemsResult.getData();
        Result<Void> itemsValidationResult = compensationPlanner.validateRefundableItems(itemsToRefund);
        if (itemsValidationResult.isError()) return itemsValidationResult.propagateError();

        OrderItemCompensationPlanner.RefundPlan refundPlan = compensationPlanner.buildRefundPlan(itemsToRefund, request);
        BigDecimal totalRefundAmount = refundPlan.totalRefundAmount();
        List<OrderItemRefund> refundRecords = refundPlan.records();

        if (refundRecords.isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
        }

        orderRefundWorkflowSupport.persistRefundRecordsAndRestoreStock(refundRecords);

        List<OrderItemEscrow> escrowsToRefund = orderRefundWorkflowSupport.resolveEscrowsToRefund(itemsToRefund);

        Result<Void> orchestratorResult = paymentOrchestrator.refundFromSellersAndEscrows(
                escrowsToRefund, user);
        
        if (orchestratorResult.isError()) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            orderLog.logRefundFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error("Failed to process refund: " + orchestratorResult.getMessage(), "REFUND_FAILED");
        }

        orderLog.logRefundProcessed(totalRefundAmount, user.getEmail(), order.getOrderNumber());

        Result<Order> reloadedOrderResult = orderRefundWorkflowSupport.reloadOrderWithItems(order.getId());
        if (reloadedOrderResult.isError()) {
            return reloadedOrderResult.propagateError();
        }
        order = reloadedOrderResult.getData();

        boolean allItemsRefunded = compensationPlanner.areAllItemsRefunded(order);
        orderStateTransitionPolicy.applyRefund(order, allItemsRefunded);
        Result<Order> savedOrderResult = orderRefundWorkflowSupport.saveOrderAndReload(order);
        if (savedOrderResult.isError()) {
            return savedOrderResult.propagateError();
        }
        Order savedOrder = savedOrderResult.getData();
        
        orderNotificationService.sendOrderRefundNotification(user, savedOrder);

        orderLog.logOrderRefunded(order.getOrderNumber(), totalRefundAmount, !allItemsRefunded, user.getEmail());
        return Result.success(orderMapper.toDto(savedOrder));
    }
}

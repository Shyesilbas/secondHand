package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.application.event.OrderRefundedEvent;
import com.serhat.secondhand.order.policy.OrderRefundPolicy;
import com.serhat.secondhand.order.policy.OrderStateTransitionPolicy;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusConsistencyLogger;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderRefundService {

    private final OrderMapper orderMapper;
    private final OrderStatusConsistencyLogger orderStatusConsistencyLogger;
    private final OrderValidationService orderValidationService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderLogService orderLog;
    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderCompensationPersistenceService compensationPersistenceService;
    private final OrderRefundPolicy orderRefundPolicy;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;
    private final OrderEscrowService orderEscrowService;
    private final ApplicationEventPublisher eventPublisher;

    public Result<OrderDto> refundOrder(Long orderId, OrderRefundRequest request, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();
        Order order = orderResult.getData();

        Result<Void> refundValidationResult = orderRefundPolicy.validateRefundable(order);
        if (refundValidationResult.isError()) return refundValidationResult.propagateError();

        orderStatusConsistencyLogger.logIfInconsistent(order);

        Result<List<OrderItem>> itemsResult = compensationPlanner.resolveOrderItems(order, request.getOrderItemIds());
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

        compensationPersistenceService.persistRefundRecordsAndRestoreStock(refundRecords);

        List<OrderItemEscrow> escrowsToRefund = orderEscrowService.findExistingEscrowsByOrderItems(itemsToRefund);

        Result<Void> orchestratorResult = paymentOrchestrator.refundFromSellersAndEscrows(escrowsToRefund, user);
        if (orchestratorResult.isError()) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            orderLog.logRefundFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error(
                    "Failed to process refund: " + orchestratorResult.getMessage(),
                    OrderErrorCodes.REFUND_FAILED.getCode()
            );
        }
        orderLog.logRefundProcessed(totalRefundAmount, user.getEmail(), order.getOrderNumber());

        Result<Order> reloadedOrderResult = compensationPersistenceService.reloadOrderWithItems(order.getId());
        if (reloadedOrderResult.isError()) return reloadedOrderResult.propagateError();
        order = reloadedOrderResult.getData();

        boolean allItemsRefunded = compensationPlanner.areAllItemsRefunded(order);
        orderStateTransitionPolicy.applyRefund(order, allItemsRefunded);

        Result<Order> savedOrderResult = compensationPersistenceService.saveOrderAndReload(order);
        if (savedOrderResult.isError()) return savedOrderResult.propagateError();
        Order savedOrder = savedOrderResult.getData();

        eventPublisher.publishEvent(new OrderRefundedEvent(savedOrder, user));
        orderLog.logOrderRefunded(order.getOrderNumber(), totalRefundAmount, !allItemsRefunded, user.getEmail());
        return Result.success(orderMapper.toDto(savedOrder));
    }
}

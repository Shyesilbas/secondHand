package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
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
    private final OrderLogService orderLog;
    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderRefundPolicy orderRefundPolicy;
    private final OrderStateTransitionPolicy orderStateTransitionPolicy;

    private final OrderRepository orderRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;
    private final OrderEscrowService orderEscrowService;
    private final OrderStockService orderStockService;

    public Result<OrderDto> refundOrder(Long orderId, OrderRefundRequest request, User user) {
        Result<Order> orderResult = validateOrderForRefund(orderId, user);
        if (orderResult.isError()) return orderResult.propagateError();

        Order order = orderResult.getData();

        Result<Void> refundValidationResult = validateRefundabilityAndStatus(order);
        if (refundValidationResult.isError()) return refundValidationResult.propagateError();

        Result<List<OrderItem>> itemsResult = resolveRefundItems(order, request);
        if (itemsResult.isError()) return itemsResult.propagateError();

        List<OrderItem> itemsToRefund = itemsResult.getData();
        Result<Void> itemsValidationResult = validateRefundableItems(itemsToRefund);
        if (itemsValidationResult.isError()) return itemsValidationResult.propagateError();

        OrderItemCompensationPlanner.RefundPlan refundPlan = compensationPlanner.buildRefundPlan(itemsToRefund, request);
        BigDecimal totalRefundAmount = refundPlan.totalRefundAmount();
        List<OrderItemRefund> refundRecords = refundPlan.records();

        if (refundRecords.isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
        }

        persistRefundRecordsAndRestoreStock(refundRecords);

        List<OrderItemEscrow> escrowsToRefund = resolveEscrowsToRefund(itemsToRefund);

        Result<Void> orchestratorResult = orchestrateRefund(order, user, escrowsToRefund, totalRefundAmount);
        if (orchestratorResult.isError()) return orchestratorResult.propagateError();

        Result<Order> reloadedOrderResult = reloadOrderWithItems(order.getId());
        if (reloadedOrderResult.isError()) {
            return reloadedOrderResult.propagateError();
        }
        order = reloadedOrderResult.getData();

        boolean allItemsRefunded = compensationPlanner.areAllItemsRefunded(order);
        orderStateTransitionPolicy.applyRefund(order, allItemsRefunded);
        Result<Order> savedOrderResult = saveOrderAndReload(order);
        if (savedOrderResult.isError()) {
            return savedOrderResult.propagateError();
        }
        Order savedOrder = savedOrderResult.getData();
        
        orderNotificationService.sendOrderRefundNotification(user, savedOrder);

        orderLog.logOrderRefunded(order.getOrderNumber(), totalRefundAmount, !allItemsRefunded, user.getEmail());
        return Result.success(orderMapper.toDto(savedOrder));
    }

    private void persistRefundRecordsAndRestoreStock(List<OrderItemRefund> refundRecords) {
        orderItemRefundRepository.saveAll(refundRecords);
        refundRecords.forEach(record ->
                orderStockService.restoreStock(record.getOrderItem(), record.getRefundedQuantity()));
        orderRepository.flush();
    }

    private List<OrderItemEscrow> resolveEscrowsToRefund(List<OrderItem> itemsToRefund) {
        return orderEscrowService.findExistingEscrowsByOrderItems(itemsToRefund);
    }

    private Result<Order> reloadOrderWithItems(Long orderId) {
        Order order = orderRepository.findByIdWithOrderItems(orderId).orElse(null);
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }
        return Result.success(order);
    }

    private Result<Order> saveOrderAndReload(Order order) {
        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();
        return reloadOrderWithItems(savedOrder.getId());
    }

    private Result<Order> validateOrderForRefund(Long orderId, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) return orderResult;
        return Result.success(orderResult.getData());
    }

    private Result<Void> validateRefundabilityAndStatus(Order order) {
        Result<Void> refundValidationResult = orderRefundPolicy.validateRefundable(order);
        if (refundValidationResult.isError()) return refundValidationResult;

        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) return consistencyResult;

        return Result.success();
    }

    private Result<List<OrderItem>> resolveRefundItems(Order order, OrderRefundRequest request) {
        return compensationPlanner.resolveOrderItems(order, request.getOrderItemIds());
    }

    private Result<Void> validateRefundableItems(List<OrderItem> itemsToRefund) {
        return compensationPlanner.validateRefundableItems(itemsToRefund);
    }

    private Result<Void> orchestrateRefund(Order order, User user, List<OrderItemEscrow> escrowsToRefund, BigDecimal totalRefundAmount) {
        Result<Void> orchestratorResult = paymentOrchestrator.refundFromSellersAndEscrows(
                escrowsToRefund, user);
        if (orchestratorResult.isError()) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            orderLog.logRefundFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error(
                    "Failed to process refund: " + orchestratorResult.getMessage(),
                    OrderErrorCodes.REFUND_FAILED.getCode()
            );
        }

        orderLog.logRefundProcessed(totalRefundAmount, user.getEmail(), order.getOrderNumber());
        return Result.success();
    }
}

package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusValidator;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
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

    public Result<OrderDto> cancelOrder(Long orderId, OrderCancelRequest request, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) {
            return Result.error(orderResult.getMessage(), orderResult.getErrorCode());
        }

        Order order = orderResult.getData();

        Result<Void> cancelValidationResult = validateOrderCanBeCancelled(order);
        if (cancelValidationResult.isError()) {
            return Result.error(cancelValidationResult.getMessage(), cancelValidationResult.getErrorCode());
        }
        
        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) {
            return Result.error(consistencyResult.getMessage(), consistencyResult.getErrorCode());
        }

        Result<List<OrderItem>> itemsResult = orderItemHelper.resolveOrderItems(order, request.getOrderItemIds());
        if (itemsResult.isError()) {
            return Result.error(itemsResult.getMessage(), itemsResult.getErrorCode());
        }
        
        List<OrderItem> itemsToCancel = itemsResult.getData();
        Result<Void> itemsValidationResult = validateItemsCanBeCancelled(itemsToCancel, order);
        if (itemsValidationResult.isError()) {
            return Result.error(itemsValidationResult.getMessage(), itemsValidationResult.getErrorCode());
        }

        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<OrderItemCancel> cancelRecords = new ArrayList<>();

        for (OrderItem item : itemsToCancel) {
            Integer alreadyCancelled = orderItemCancelRepository.sumCancelledQuantityByOrderItem(item);
            int availableToCancel = item.getQuantity() - (alreadyCancelled != null ? alreadyCancelled : 0);
            
            if (availableToCancel <= 0) {
                continue;
            }

            BigDecimal refundAmount = item.getTotalPrice();
            totalRefundAmount = totalRefundAmount.add(refundAmount);

            OrderItemCancel cancelRecord = OrderItemCancel.builder()
                    .orderItem(item)
                    .reason(request.getReason())
                    .reasonText(request.getReasonText())
                    .cancelledQuantity(availableToCancel)
                    .refundAmount(refundAmount)
                    .build();
            cancelRecords.add(cancelRecord);
        }

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
            log.error("Failed to cancel escrows and refund buyer for order: {} - {}", 
                    order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error("Failed to process refund. Please contact support.", "REFUND_FAILED");
        }

        log.info("Successfully cancelled escrows and refunded {} to buyer {} for order {}", 
                totalRefundAmount, user.getEmail(), order.getOrderNumber());

        return orderRepository.findByIdWithOrderItems(order.getId())
                .map(refreshedOrder -> processCancellationStatus(refreshedOrder, user))
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }
    
    private Result<OrderDto> processCancellationStatus(Order order, User user) {
        boolean allItemsCancelled = areAllItemsCancelled(order);
        if (allItemsCancelled) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            if (order.getShipping() != null && order.getShipping().getStatus() != ShippingStatus.DELIVERED) {
                order.getShipping().setStatus(ShippingStatus.CANCELLED);
            }
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.PARTIALLY_REFUNDED);
        }

        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();
        
        return orderRepository.findByIdWithOrderItems(savedOrder.getId())
                .map(finalOrder -> {
                    orderNotificationService.sendOrderCancellationNotification(user, finalOrder);
                    log.info("Order cancelled: {} (partial: {})", order.getOrderNumber(), !allItemsCancelled);
                    return Result.success(orderMapper.toDto(finalOrder));
                })
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }


    private Result<Void> validateOrderCanBeCancelled(Order order) {
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (!Order.OrderStatus.CANCELLABLE_STATUSES.contains(order.getStatus())) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED);
        }
        return Result.success();
    }


    private Result<Void> validateItemsCanBeCancelled(List<OrderItem> items, Order order) {
        for (OrderItem item : items) {
            if (!item.getOrder().getId().equals(order.getId())) {
                return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
            }
            Integer alreadyCancelled = orderItemCancelRepository.sumCancelledQuantityByOrderItem(item);
            if (alreadyCancelled != null && alreadyCancelled >= item.getQuantity()) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_CANCELLED);
            }
        }
        return Result.success();
    }

    private boolean areAllItemsCancelled(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Integer cancelled = orderItemCancelRepository.sumCancelledQuantityByOrderItem(item);
            if (cancelled == null || cancelled < item.getQuantity()) {
                return false;
            }
        }
        return true;
    }


}

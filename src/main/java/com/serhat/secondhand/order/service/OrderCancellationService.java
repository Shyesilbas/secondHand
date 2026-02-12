package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusValidator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderCancellationService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderEscrowService orderEscrowService;
    private final IOrderValidationService orderValidationService;
    private final com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator paymentOrchestrator;

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

        Result<List<OrderItem>> itemsResult = determineItemsToCancel(order, request.getOrderItemIds());
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
        orderRepository.flush();

        List<com.serhat.secondhand.order.entity.OrderItemEscrow> escrowsToCancel = itemsToCancel.stream()
                .map(item -> orderEscrowService.findEscrowByOrderItem(item))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());

        Result<Void> orchestratorResult = paymentOrchestrator.cancelEscrowsAndRefundBuyer(escrowsToCancel, user);
        if (orchestratorResult.isError()) {
            log.error("Failed to cancel escrows and refund buyer for order: {} - {}", 
                    order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error("Failed to process refund. Please contact support.", "REFUND_FAILED");
        }

        log.info("Successfully cancelled escrows and refunded {} to buyer {} for order {}", 
                totalRefundAmount, user.getEmail(), order.getOrderNumber());

        order = orderRepository.findByIdWithOrderItems(order.getId())
                .orElse(null);
        
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        boolean allItemsCancelled = areAllItemsCancelled(order);
        if (allItemsCancelled) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            if (order.getShipping() != null && order.getShipping().getStatus() != com.serhat.secondhand.order.entity.enums.ShippingStatus.DELIVERED) {
                order.getShipping().setStatus(com.serhat.secondhand.order.entity.enums.ShippingStatus.CANCELLED);
            }
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.PARTIALLY_REFUNDED);
        }

        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();
        
        savedOrder = orderRepository.findByIdWithOrderItems(savedOrder.getId())
                .orElse(null);
        
        if (savedOrder == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }
        
        orderNotificationService.sendOrderCancellationNotification(user, savedOrder);

        log.info("Order cancelled: {} (partial: {})", order.getOrderNumber(), !allItemsCancelled);
        return Result.success(orderMapper.toDto(savedOrder));
    }


    private Result<Void> validateOrderCanBeCancelled(Order order) {
        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_CANCELLED);
        }
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        return Result.success();
    }

    private Result<List<OrderItem>> determineItemsToCancel(Order order, List<Long> orderItemIds) {
        if (orderItemIds == null || orderItemIds.isEmpty()) {
            return Result.success(order.getOrderItems());
        }
        
        List<OrderItem> items = new ArrayList<>();
        for (Long id : orderItemIds) {
            OrderItem item = orderItemRepository.findById(id).orElse(null);
            if (item == null) {
                return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
            }
            if (!item.getOrder().getId().equals(order.getId())) {
                return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
            }
            items.add(item);
        }
        return Result.success(items);
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

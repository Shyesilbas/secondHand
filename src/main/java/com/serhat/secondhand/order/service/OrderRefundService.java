package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
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
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderRefundService {

    private static final int REFUND_WINDOW_HOURS = 48;

    private final OrderRepository orderRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderEscrowService orderEscrowService;
    private final IOrderValidationService orderValidationService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderItemHelper orderItemHelper;
    private final OrderStockService orderStockService;

    public Result<OrderDto> refundOrder(Long orderId, OrderRefundRequest request, User user) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, user);
        if (orderResult.isError()) {
            return Result.error(orderResult.getMessage(), orderResult.getErrorCode());
        }

        Order order = orderResult.getData();

        Result<Void> refundValidationResult = validateOrderCanBeRefunded(order);
        if (refundValidationResult.isError()) {
            return Result.error(refundValidationResult.getMessage(), refundValidationResult.getErrorCode());
        }
        
        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(order);
        if (consistencyResult.isError()) {
            return Result.error(consistencyResult.getMessage(), consistencyResult.getErrorCode());
        }

        Result<List<OrderItem>> itemsResult = orderItemHelper.resolveOrderItems(order, request.getOrderItemIds());
        if (itemsResult.isError()) {
            return Result.error(itemsResult.getMessage(), itemsResult.getErrorCode());
        }
        
        List<OrderItem> itemsToRefund = itemsResult.getData();
        Result<Void> itemsValidationResult = validateItemsCanBeRefunded(itemsToRefund, order);
        if (itemsValidationResult.isError()) {
            return Result.error(itemsValidationResult.getMessage(), itemsValidationResult.getErrorCode());
        }

        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<OrderItemRefund> refundRecords = new ArrayList<>();

        for (OrderItem item : itemsToRefund) {
            Integer alreadyRefunded = orderItemRefundRepository.sumRefundedQuantityByOrderItem(item);
            int availableToRefund = item.getQuantity() - (alreadyRefunded != null ? alreadyRefunded : 0);
            
            if (availableToRefund <= 0) {
                continue;
            }

            BigDecimal refundAmount = item.getTotalPrice();
            totalRefundAmount = totalRefundAmount.add(refundAmount);

            OrderItemRefund refundRecord = OrderItemRefund.builder()
                    .orderItem(item)
                    .reason(request.getReason())
                    .reasonText(request.getReasonText())
                    .refundedQuantity(availableToRefund)
                    .refundAmount(refundAmount)
                    .build();
            refundRecords.add(refundRecord);
        }

        if (refundRecords.isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
        }

        orderItemRefundRepository.saveAll(refundRecords);
        refundRecords.forEach(record ->
                orderStockService.restoreStock(record.getOrderItem(), record.getRefundedQuantity()));
        orderRepository.flush();

        List<OrderItemEscrow> escrowsToRefund = itemsToRefund.stream()
                .map(item -> orderEscrowService.findEscrowByOrderItem(item))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();

        Result<Void> orchestratorResult = paymentOrchestrator.refundFromSellersAndEscrows(
                escrowsToRefund, user, itemsToRefund);
        
        if (orchestratorResult.isError()) {
            log.error("Failed to process refund via orchestrator for order: {} - {}", 
                    order.getOrderNumber(), orchestratorResult.getMessage());
            return Result.error("Failed to process refund: " + orchestratorResult.getMessage(), "REFUND_FAILED");
        }

        log.info("Successfully refunded {} to buyer {} for order {}", 
                totalRefundAmount, user.getEmail(), order.getOrderNumber());

        order = orderRepository.findByIdWithOrderItems(order.getId())
                .orElse(null);
        
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        boolean allItemsRefunded = areAllItemsRefunded(order);
        if (allItemsRefunded) {
            order.setStatus(Order.OrderStatus.REFUNDED);
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.PARTIALLY_REFUNDED);
        }
        if (order.getShipping() != null && order.getShipping().getStatus() != ShippingStatus.DELIVERED) {
            order.getShipping().setStatus(ShippingStatus.DELIVERED);
        }

        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();
        
        savedOrder = orderRepository.findByIdWithOrderItems(savedOrder.getId())
                .orElse(null);
        
        if (savedOrder == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }
        
        orderNotificationService.sendOrderRefundNotification(user, savedOrder);

        log.info("Order refunded: {} (partial: {})", order.getOrderNumber(), !allItemsRefunded);
        return Result.success(orderMapper.toDto(savedOrder));
    }


    private Result<Void> validateOrderCanBeRefunded(Order order) {
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }
        if (!Order.OrderStatus.REFUNDABLE_STATUSES.contains(order.getStatus())) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }

        if (order.getShipping() == null || order.getShipping().getDeliveredAt() == null) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(order.getShipping().getDeliveredAt(), now);
        long hoursPassed = duration.toHours();

        if (hoursPassed >= REFUND_WINDOW_HOURS) {
            return Result.error(OrderErrorCodes.REFUND_TIME_EXPIRED);
        }
        return Result.success();
    }


    private Result<Void> validateItemsCanBeRefunded(List<OrderItem> items, Order order) {
        for (OrderItem item : items) {
            if (!item.getOrder().getId().equals(order.getId())) {
                return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
            }
            Integer alreadyRefunded = orderItemRefundRepository.sumRefundedQuantityByOrderItem(item);
            if (alreadyRefunded != null && alreadyRefunded >= item.getQuantity()) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
            }
        }
        return Result.success();
    }

    private boolean areAllItemsRefunded(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Integer refunded = orderItemRefundRepository.sumRefundedQuantityByOrderItem(item);
            if (refunded == null || refunded < item.getQuantity()) {
                return false;
            }
        }
        return true;
    }


}

package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.service.EWalletService;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
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
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
    private final EWalletService eWalletService;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderEscrowService orderEscrowService;

    public Result<OrderDto> cancelOrder(Long orderId, OrderCancelRequest request, User user) {
        Result<Order> orderResult = findOrderByIdAndValidateOwnership(orderId, user);
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

        cancelEscrowsForItems(itemsToCancel, user, order);

        try {
            UUID firstListingId = itemsToCancel.isEmpty() ? null : itemsToCancel.get(0).getListing().getId();
            eWalletService.creditToUser(user, totalRefundAmount, firstListingId, PaymentTransactionType.REFUND);
            log.info("Refunded {} to eWallet for user: {} for order: {}", totalRefundAmount, user.getEmail(), order.getOrderNumber());

            Map<com.serhat.secondhand.user.domain.entity.User, BigDecimal> sellerRefunds = itemsToCancel.stream()
                    .collect(Collectors.groupingBy(
                            item -> item.getListing().getSeller(),
                            Collectors.reducing(BigDecimal.ZERO, OrderItem::getTotalPrice, BigDecimal::add)
                    ));

            for (Map.Entry<com.serhat.secondhand.user.domain.entity.User, BigDecimal> entry : sellerRefunds.entrySet()) {
                com.serhat.secondhand.user.domain.entity.User seller = entry.getKey();
                BigDecimal sellerAmount = entry.getValue();
                UUID sellerListingId = itemsToCancel.stream()
                        .filter(item -> item.getListing().getSeller().getId().equals(seller.getId()))
                        .findFirst()
                        .map(item -> item.getListing().getId())
                        .orElse(null);

                try {
                    eWalletService.debitFromUser(seller, sellerAmount, sellerListingId, PaymentTransactionType.REFUND);
                    log.info("Debited {} from seller's eWallet: {} for order: {}", sellerAmount, seller.getEmail(), order.getOrderNumber());
                } catch (BusinessException e) {
                    log.error("Failed to debit from seller's eWallet: {} order: {} - Error: {} [{}]", 
                            seller.getEmail(), order.getOrderNumber(), e.getMessage(), e.getErrorCode(), e);
                } catch (DataAccessException e) {
                    log.error("Database error while debiting from seller's eWallet: {} order: {} - {}", 
                            seller.getEmail(), order.getOrderNumber(), e.getMessage(), e);
                }
            }
        } catch (BusinessException e) {
            log.error("Business error during refund to eWallet for user: {} order: {} - Error: {} [{}]", 
                    user.getEmail(), order.getOrderNumber(), e.getMessage(), e.getErrorCode(), e);
            return Result.error("Failed to process refund. Please contact support.", "REFUND_FAILED");
        } catch (DataAccessException e) {
            log.error("Database error during refund to eWallet for user: {} order: {} - {}", 
                    user.getEmail(), order.getOrderNumber(), e.getMessage(), e);
            return Result.error("Failed to process refund due to a system error. Please try again later.", "REFUND_FAILED");
        }

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

    private Result<Order> findOrderByIdAndValidateOwnership(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElse(null);
        
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        if (!order.getUser().getId().equals(user.getId())) {
            return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }

        return Result.success(order);
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

    private void cancelEscrowsForItems(List<OrderItem> itemsToCancel, User buyer, Order order) {
        for (OrderItem item : itemsToCancel) {
            orderEscrowService.findEscrowByOrderItem(item).ifPresent(escrow -> {
                Result<Void> cancelResult = orderEscrowService.cancelEscrow(escrow, buyer);
                if (cancelResult.isError()) {
                    log.error("Failed to cancel escrow {} for order item {}: {}", 
                            escrow.getId(), item.getId(), cancelResult.getMessage());
                } else {
                    log.info("Cancelled escrow {} for order item {} in order {}", 
                            escrow.getId(), item.getId(), order.getOrderNumber());
                }
            });
        }
    }
}

package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.service.EWalletService;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
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
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderRefundService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;
    private final OrderNotificationService orderNotificationService;
    private final OrderMapper orderMapper;
    private final EWalletService eWalletService;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderEscrowService orderEscrowService;

    public Result<OrderDto> refundOrder(Long orderId, OrderRefundRequest request, User user) {
        Result<Order> orderResult = findOrderByIdAndValidateOwnership(orderId, user);
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

        Result<List<OrderItem>> itemsResult = determineItemsToRefund(order, request.getOrderItemIds());
        if (itemsResult.isError()) {
            return Result.error(itemsResult.getMessage(), itemsResult.getErrorCode());
        }
        
        List<OrderItem> itemsToRefund = itemsResult.getData();
        Result<Void> itemsValidationResult = validateItemsCanBeRefunded(itemsToRefund, order);
        if (itemsValidationResult.isError()) {
            return Result.error(itemsValidationResult.getMessage(), itemsValidationResult.getErrorCode());
        }

        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        BigDecimal escrowRefundAmount = BigDecimal.ZERO;
        List<OrderItemRefund> refundRecords = new ArrayList<>();

        for (OrderItem item : itemsToRefund) {
            Integer alreadyRefunded = orderItemRefundRepository.sumRefundedQuantityByOrderItem(item);
            int availableToRefund = item.getQuantity() - (alreadyRefunded != null ? alreadyRefunded : 0);
            
            if (availableToRefund <= 0) {
                continue;
            }

            BigDecimal refundAmount = item.getTotalPrice();
            totalRefundAmount = totalRefundAmount.add(refundAmount);

            Optional<OrderItemEscrow> escrowOpt = orderEscrowService.findEscrowByOrderItem(item);
            if (escrowOpt.isPresent() && escrowOpt.get().getStatus() != OrderItemEscrow.EscrowStatus.REFUNDED) {
                escrowRefundAmount = escrowRefundAmount.add(escrowOpt.get().getAmount());
            }

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
        orderRepository.flush();

        refundEscrowsForItems(itemsToRefund, user, order);

        try {
            BigDecimal nonEscrowRefundAmount = totalRefundAmount.subtract(escrowRefundAmount);
            if (nonEscrowRefundAmount.compareTo(BigDecimal.ZERO) > 0) {
                UUID firstListingId = itemsToRefund.isEmpty() ? null : itemsToRefund.get(0).getListing().getId();
                eWalletService.creditToUser(user, nonEscrowRefundAmount, firstListingId, PaymentTransactionType.REFUND);
                log.info("Refunded {} to eWallet for user: {} for order: {} (non-escrow amount)", nonEscrowRefundAmount, user.getEmail(), order.getOrderNumber());
            } else {
                log.info("All refund amount handled via escrow refund for user: {} for order: {}", user.getEmail(), order.getOrderNumber());
            }

            Map<com.serhat.secondhand.user.domain.entity.User, BigDecimal> sellerRefunds = itemsToRefund.stream()
                    .collect(Collectors.groupingBy(
                            item -> item.getListing().getSeller(),
                            Collectors.reducing(BigDecimal.ZERO, OrderItem::getTotalPrice, BigDecimal::add)
                    ));

            for (Map.Entry<com.serhat.secondhand.user.domain.entity.User, BigDecimal> entry : sellerRefunds.entrySet()) {
                com.serhat.secondhand.user.domain.entity.User seller = entry.getKey();
                BigDecimal sellerAmount = entry.getValue();
                UUID sellerListingId = itemsToRefund.stream()
                        .filter(item -> item.getListing().getSeller().getId().equals(seller.getId()))
                        .findFirst()
                        .map(item -> item.getListing().getId())
                        .orElse(null);

                try {
                    eWalletService.debitFromUser(seller, sellerAmount, sellerListingId, PaymentTransactionType.REFUND);
                    log.info("Debited {} from seller's eWallet: {} for order: {}", sellerAmount, seller.getEmail(), order.getOrderNumber());
                } catch (Exception e) {
                    log.error("Failed to debit from seller's eWallet: {} order: {} - {}", seller.getEmail(), order.getOrderNumber(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to refund to eWallet for user: {} order: {} - {}", user.getEmail(), order.getOrderNumber(), e.getMessage(), e);
            return Result.error("Failed to process refund: " + e.getMessage(), "REFUND_FAILED");
        }

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
        if (order.getShipping() != null && order.getShipping().getStatus() != com.serhat.secondhand.order.entity.enums.ShippingStatus.DELIVERED) {
            order.getShipping().setStatus(com.serhat.secondhand.order.entity.enums.ShippingStatus.DELIVERED);
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

    private Result<Void> validateOrderCanBeRefunded(Order order) {
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            return Result.error(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }

        if (order.getShipping() == null || order.getShipping().getDeliveredAt() == null) {
            return Result.error(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(order.getShipping().getDeliveredAt(), now);
        long hoursPassed = duration.toHours();

        if (hoursPassed >= 48) {
            return Result.error(OrderErrorCodes.REFUND_TIME_EXPIRED);
        }
        return Result.success();
    }

    private Result<List<OrderItem>> determineItemsToRefund(Order order, List<Long> orderItemIds) {
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

    private void refundEscrowsForItems(List<OrderItem> itemsToRefund, User buyer, Order order) {
        for (OrderItem item : itemsToRefund) {
            orderEscrowService.findEscrowByOrderItem(item).ifPresent(escrow -> {
                try {
                    if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
                        UUID listingId = item.getListing().getId();
                        eWalletService.debitFromUser(escrow.getSeller(), escrow.getAmount(), listingId, PaymentTransactionType.REFUND);
                        log.info("Debited {} from seller's eWallet: {} for refunded order item {}", 
                                escrow.getAmount(), escrow.getSeller().getEmail(), item.getId());
                    }
                    Result<Void> refundResult = orderEscrowService.refundEscrowToBuyer(escrow, buyer);
                    if (refundResult.isError()) {
                        log.error("Failed to refund escrow {} for order item {}: {}", 
                                escrow.getId(), item.getId(), refundResult.getMessage());
                    } else {
                        log.info("Refunded escrow {} for order item {} in order {}", 
                                escrow.getId(), item.getId(), order.getOrderNumber());
                    }
                } catch (Exception e) {
                    log.error("Failed to refund escrow {} for order item {}: {}", 
                            escrow.getId(), item.getId(), e.getMessage());
                }
            });
        }
    }
}

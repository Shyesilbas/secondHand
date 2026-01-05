package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.exception.BusinessException;
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

    public OrderDto refundOrder(Long orderId, OrderRefundRequest request, User user) {
        Order order = findOrderByIdAndValidateOwnership(orderId, user);

        validateOrderCanBeRefunded(order);
        orderStatusValidator.validateStatusConsistency(order);

        List<OrderItem> itemsToRefund = determineItemsToRefund(order, request.getOrderItemIds());
        validateItemsCanBeRefunded(itemsToRefund, order);

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
            throw new BusinessException(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
        }

        orderItemRefundRepository.saveAll(refundRecords);
        orderRepository.flush();

        refundEscrowsForItems(itemsToRefund, user, order);

        try {
            UUID firstListingId = itemsToRefund.isEmpty() ? null : itemsToRefund.get(0).getListing().getId();
            eWalletService.creditToUser(user, totalRefundAmount, firstListingId, PaymentTransactionType.REFUND);
            log.info("Refunded {} to eWallet for user: {} for order: {}", totalRefundAmount, user.getEmail(), order.getOrderNumber());

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
            throw new BusinessException("Failed to process refund: " + e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "REFUND_FAILED");
        }

        order = orderRepository.findByIdWithOrderItems(order.getId())
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

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
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));
        
        orderNotificationService.sendOrderRefundNotification(user, savedOrder);

        log.info("Order refunded: {} (partial: {})", order.getOrderNumber(), !allItemsRefunded);
        return orderMapper.toDto(savedOrder);
    }

    private Order findOrderByIdAndValidateOwnership(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }

        return order;
    }

    private void validateOrderCanBeRefunded(Order order) {
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new BusinessException(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new BusinessException(OrderErrorCodes.ORDER_ALREADY_COMPLETED);
        }

        if (order.getShipping() == null || order.getShipping().getDeliveredAt() == null) {
            throw new BusinessException(OrderErrorCodes.ORDER_CANNOT_BE_REFUNDED);
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(order.getShipping().getDeliveredAt(), now);
        long hoursPassed = duration.toHours();

        if (hoursPassed >= 48) {
            throw new BusinessException(OrderErrorCodes.REFUND_TIME_EXPIRED);
        }
    }

    private List<OrderItem> determineItemsToRefund(Order order, List<Long> orderItemIds) {
        if (orderItemIds == null || orderItemIds.isEmpty()) {
            return order.getOrderItems();
        }
        return orderItemIds.stream()
                .map(id -> orderItemRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(OrderErrorCodes.ORDER_NOT_FOUND)))
                .filter(item -> item.getOrder().getId().equals(order.getId()))
                .collect(Collectors.toList());
    }

    private void validateItemsCanBeRefunded(List<OrderItem> items, Order order) {
        for (OrderItem item : items) {
            if (!item.getOrder().getId().equals(order.getId())) {
                throw new BusinessException(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
            }
            Integer alreadyRefunded = orderItemRefundRepository.sumRefundedQuantityByOrderItem(item);
            if (alreadyRefunded != null && alreadyRefunded >= item.getQuantity()) {
                throw new BusinessException(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
            }
        }
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
                    orderEscrowService.refundEscrowToBuyer(escrow, buyer);
                    log.info("Refunded escrow {} for order item {} in order {}", 
                            escrow.getId(), item.getId(), order.getOrderNumber());
                } catch (Exception e) {
                    log.error("Failed to refund escrow {} for order item {}: {}", 
                            escrow.getId(), item.getId(), e.getMessage());
                }
            });
        }
    }
}

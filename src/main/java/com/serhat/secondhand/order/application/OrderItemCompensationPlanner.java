package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OrderItemCompensationPlanner {

    private final OrderItemRepository orderItemRepository;
    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;

    /**
     * Resolves order items by their IDs.
     * If orderItemIds is null/empty, returns all items of the order (full cancel/refund).
     * Validates each item belongs to the given order.
     */
    public Result<List<OrderItem>> resolveOrderItems(Order order, List<Long> orderItemIds) {
        if (orderItemIds == null || orderItemIds.isEmpty()) {
            return Result.success(order.getOrderItems());
        }

        List<OrderItem> items = new ArrayList<>();
        for (Long id : orderItemIds) {
            OrderItem item = orderItemRepository.findById(id).orElse(null);
            if (item == null) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_NOT_FOUND);
            }
            if (!item.getOrder().getId().equals(order.getId())) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_NOT_BELONG_TO_ORDER);
            }
            items.add(item);
        }
        return Result.success(items);
    }

    public Result<Void> validateCancellableItems(List<OrderItem> items) {
        for (OrderItem item : items) {
            int alreadyCompensated = compensatedQuantity(item);
            if (alreadyCompensated >= item.getQuantity()) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_CANCELLED);
            }
        }
        return Result.success();
    }

    public Result<Void> validateRefundableItems(List<OrderItem> items) {
        for (OrderItem item : items) {
            int alreadyCompensated = compensatedQuantity(item);
            if (alreadyCompensated >= item.getQuantity()) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
            }
        }
        return Result.success();
    }

    public CancellationPlan buildCancellationPlan(List<OrderItem> items, OrderCancelRequest request) {
        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<OrderItemCancel> cancelRecords = new ArrayList<>();

        for (OrderItem item : items) {
            int availableToCancel = item.getQuantity() - compensatedQuantity(item);
            if (availableToCancel <= 0) {
                continue;
            }

            BigDecimal refundAmount = calculateCompensationAmount(item, availableToCancel);
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

        return new CancellationPlan(cancelRecords, totalRefundAmount);
    }

    public RefundPlan buildRefundPlan(List<OrderItem> items, OrderRefundRequest request) {
        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<OrderItemRefund> refundRecords = new ArrayList<>();

        for (OrderItem item : items) {
            int availableToRefund = item.getQuantity() - compensatedQuantity(item);
            if (availableToRefund <= 0) {
                continue;
            }

            BigDecimal refundAmount = calculateCompensationAmount(item, availableToRefund);
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

        return new RefundPlan(refundRecords, totalRefundAmount);
    }

    public boolean areAllItemsCancelled(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) return true;
        
        List<Long> itemIds = order.getOrderItems().stream().map(OrderItem::getId).toList();
        Map<Long, Integer> cancelledMap = orderItemCancelRepository.findCancelledQuantitiesByOrderItemIds(new java.util.HashSet<>(itemIds)).stream()
                .collect(java.util.stream.Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));
        Map<Long, Integer> refundedMap = orderItemRefundRepository.findRefundedQuantitiesByOrderItemIds(new java.util.HashSet<>(itemIds)).stream()
                .collect(java.util.stream.Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));

        for (OrderItem item : order.getOrderItems()) {
            int compensated = cancelledMap.getOrDefault(item.getId(), 0) + refundedMap.getOrDefault(item.getId(), 0);
            if (compensated < item.getQuantity()) {
                return false;
            }
        }
        return true;
    }

    public boolean areAllItemsRefunded(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) return true;
        
        List<Long> itemIds = order.getOrderItems().stream().map(OrderItem::getId).toList();
        Map<Long, Integer> refundedMap = orderItemRefundRepository.findRefundedQuantitiesByOrderItemIds(new java.util.HashSet<>(itemIds)).stream()
                .collect(java.util.stream.Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));
        Map<Long, Integer> cancelledMap = orderItemCancelRepository.findCancelledQuantitiesByOrderItemIds(new java.util.HashSet<>(itemIds)).stream()
                .collect(java.util.stream.Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));

        for (OrderItem item : order.getOrderItems()) {
            int compensated = refundedMap.getOrDefault(item.getId(), 0) + cancelledMap.getOrDefault(item.getId(), 0);
            if (compensated < item.getQuantity()) {
                return false;
            }
        }
        return true;
    }

    private int cancelledQuantity(OrderItem item) {
        Integer cancelled = orderItemCancelRepository.sumCancelledQuantityByOrderItem(item);
        return cancelled != null ? cancelled : 0;
    }

    private int refundedQuantity(OrderItem item) {
        Integer refunded = orderItemRefundRepository.sumRefundedQuantityByOrderItem(item);
        return refunded != null ? refunded : 0;
    }

    private int compensatedQuantity(OrderItem item) {
        return cancelledQuantity(item) + refundedQuantity(item);
    }

    private BigDecimal calculateCompensationAmount(OrderItem item, int compensatedQuantity) {
        if (item == null || item.getOrder() == null || item.getOrder().getOrderItems() == null || item.getOrder().getOrderItems().isEmpty()) {
            return item != null && item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO;
        }

        BigDecimal itemSubtotal = item.getOrder().getOrderItems().stream()
                .map(OrderItem::getTotalPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (itemSubtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal payableTotal = item.getOrder().getTotalAmount() != null ? item.getOrder().getTotalAmount() : itemSubtotal;
        if (payableTotal.compareTo(BigDecimal.ZERO) < 0) {
            payableTotal = BigDecimal.ZERO;
        }
        if (payableTotal.compareTo(itemSubtotal) > 0) {
            payableTotal = itemSubtotal;
        }

        BigDecimal itemTotal = item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal itemPaidAmount = payableTotal.multiply(itemTotal).divide(itemSubtotal, 2, RoundingMode.HALF_UP);
        if (item.getQuantity() == null || item.getQuantity() <= 0 || compensatedQuantity >= item.getQuantity()) {
            return itemPaidAmount.setScale(2, RoundingMode.HALF_UP);
        }
        return itemPaidAmount.multiply(BigDecimal.valueOf(compensatedQuantity))
                .divide(BigDecimal.valueOf(item.getQuantity()), 2, RoundingMode.HALF_UP);
    }

    public record CancellationPlan(List<OrderItemCancel> records, BigDecimal totalRefundAmount) {
    }

    public record RefundPlan(List<OrderItemRefund> records, BigDecimal totalRefundAmount) {
    }
}

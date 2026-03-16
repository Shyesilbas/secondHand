package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderItemCompensationPlanner {

    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;

    public Result<Void> validateCancellableItems(List<OrderItem> items) {
        for (OrderItem item : items) {
            int alreadyCancelled = cancelledQuantity(item);
            if (alreadyCancelled >= item.getQuantity()) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_CANCELLED);
            }
        }
        return Result.success();
    }

    public Result<Void> validateRefundableItems(List<OrderItem> items) {
        for (OrderItem item : items) {
            int alreadyRefunded = refundedQuantity(item);
            if (alreadyRefunded >= item.getQuantity()) {
                return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_REFUNDED);
            }
        }
        return Result.success();
    }

    public CancellationPlan buildCancellationPlan(List<OrderItem> items, OrderCancelRequest request) {
        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<OrderItemCancel> cancelRecords = new ArrayList<>();

        for (OrderItem item : items) {
            int availableToCancel = item.getQuantity() - cancelledQuantity(item);
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

        return new CancellationPlan(cancelRecords, totalRefundAmount);
    }

    public RefundPlan buildRefundPlan(List<OrderItem> items, OrderRefundRequest request) {
        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<OrderItemRefund> refundRecords = new ArrayList<>();

        for (OrderItem item : items) {
            int availableToRefund = item.getQuantity() - refundedQuantity(item);
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

        return new RefundPlan(refundRecords, totalRefundAmount);
    }

    public boolean areAllItemsCancelled(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            if (!isFullyCancelled(item)) {
                return false;
            }
        }
        return true;
    }

    public boolean areAllItemsRefunded(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            if (!isFullyRefunded(item)) {
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

    private boolean isFullyCancelled(OrderItem item) {
        return cancelledQuantity(item) >= item.getQuantity();
    }

    private boolean isFullyRefunded(OrderItem item) {
        return refundedQuantity(item) >= item.getQuantity();
    }

    public record CancellationPlan(List<OrderItemCancel> records, BigDecimal totalRefundAmount) {
    }

    public record RefundPlan(List<OrderItemRefund> records, BigDecimal totalRefundAmount) {
    }
}

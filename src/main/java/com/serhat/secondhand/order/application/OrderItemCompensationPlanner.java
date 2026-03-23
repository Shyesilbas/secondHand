package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCompensationRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.function.ToIntFunction;

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
                return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
            }
            items.add(item);
        }
        return Result.success(items);
    }

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

    public CancellationPlan buildCancellationPlan(List<OrderItem> items, OrderCompensationRequest request) {
        CompensationPlan<OrderItemCancel> plan = buildCompensationPlan(
                items,
                request,
                this::cancelledQuantity,
                (item, quantity, refundAmount) -> OrderItemCancel.builder()
                        .orderItem(item)
                        .reason(request.getReason())
                        .reasonText(request.getReasonText())
                        .cancelledQuantity(quantity)
                        .refundAmount(refundAmount)
                        .build()
        );

        return new CancellationPlan(plan.records(), plan.totalRefundAmount());
    }

    public RefundPlan buildRefundPlan(List<OrderItem> items, OrderCompensationRequest request) {
        CompensationPlan<OrderItemRefund> plan = buildCompensationPlan(
                items,
                request,
                this::refundedQuantity,
                (item, quantity, refundAmount) -> OrderItemRefund.builder()
                        .orderItem(item)
                        .reason(request.getReason())
                        .reasonText(request.getReasonText())
                        .refundedQuantity(quantity)
                        .refundAmount(refundAmount)
                        .build()
        );

        return new RefundPlan(plan.records(), plan.totalRefundAmount());
    }

    private <T> CompensationPlan<T> buildCompensationPlan(
            List<OrderItem> items,
            OrderCompensationRequest request,
            ToIntFunction<OrderItem> processedQuantityProvider,
            CompensationRecordFactory<T> recordFactory
    ) {
        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<T> records = new ArrayList<>();

        for (OrderItem item : items) {
            int availableQuantity = item.getQuantity() - processedQuantityProvider.applyAsInt(item);
            if (availableQuantity <= 0) {
                continue;
            }

            BigDecimal refundAmount = item.getTotalPrice();
            totalRefundAmount = totalRefundAmount.add(refundAmount);
            records.add(recordFactory.create(item, availableQuantity, refundAmount));
        }

        return new CompensationPlan<>(records, totalRefundAmount);
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

    private record CompensationPlan<T>(List<T> records, BigDecimal totalRefundAmount) {
    }

    @FunctionalInterface
    private interface CompensationRecordFactory<T> {
        T create(OrderItem item, int quantity, BigDecimal refundAmount);
    }
}

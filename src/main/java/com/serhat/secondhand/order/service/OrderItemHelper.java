package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Shared helper for resolving and validating order items.
 * Used by both OrderCancellationService and OrderRefundService
 * to avoid code duplication.
 */
@Component
@RequiredArgsConstructor
public class OrderItemHelper {

    private final OrderItemRepository orderItemRepository;

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
}


package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/** Decides whether a seller may ship a cargo order; used by the ship endpoint and the SHIP action. */
@Component
public class OrderShippingPolicy {

    public Result<Void> validateShippable(Order order, Long sellerId) {
        if (order.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP || order.getShipping() == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_SHIPPABLE);
        }
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_NOT_FOUND);
        }

        Set<Long> sellerIds = order.getOrderItems().stream()
                .map(OrderItem::getSeller)
                .map(itemSeller -> itemSeller != null ? itemSeller.getId() : null)
                .collect(Collectors.toSet());

        if (sellerIds.contains(null)) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_MISSING_SELLER);
        }
        if (!sellerIds.contains(sellerId)) {
            return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
        if (sellerIds.size() > 1) {
            return Result.error(OrderErrorCodes.ORDER_HAS_MULTIPLE_SELLERS);
        }
        if (order.getStatus() == null || !order.getStatus().isShippable()) {
            return Result.error(OrderErrorCodes.ORDER_NOT_SHIPPABLE);
        }
        if (order.getOrderItems().stream().anyMatch(item -> !Objects.equals(sellerId, item.getSeller().getId()))) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_MISSING_SELLER);
        }
        return Result.success();
    }
}

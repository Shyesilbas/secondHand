package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;

import java.util.List;

public record CancellationValidationResult(
        Order validatedOrder,
        List<OrderItem> cancellableItems,
        Result<Void> validationResult) {
}


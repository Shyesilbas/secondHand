package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.policy.OrderCancellationPolicy;
import com.serhat.secondhand.order.validator.OrderStatusValidator;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCancellationValidationService {

    private final IOrderValidationService orderValidationService;
    private final OrderCancellationPolicy orderCancellationPolicy;
    private final OrderStatusValidator orderStatusValidator;
    private final OrderItemCompensationPlanner compensationPlanner;

    public CancellationValidationResult validate(Order order, OrderCancelRequest request, User user) {
        if (order == null || order.getId() == null) {
            return new CancellationValidationResult(
                    null,
                    List.of(),
                    Result.error(OrderErrorCodes.ORDER_NOT_FOUND)
            );
        }

        Result<Order> orderResult = orderValidationService.validateOwnership(order.getId(), user);
        if (orderResult.isError()) {
            return new CancellationValidationResult(
                    null,
                    List.of(),
                    orderResult.propagateError()
            );
        }

        Order validatedOrder = orderResult.getData();

        Result<Void> cancelValidationResult = orderCancellationPolicy.validateCancellable(validatedOrder);
        if (cancelValidationResult.isError()) {
            return new CancellationValidationResult(validatedOrder, List.of(), cancelValidationResult);
        }

        Result<Void> consistencyResult = orderStatusValidator.validateStatusConsistency(validatedOrder);
        if (consistencyResult.isError()) {
            return new CancellationValidationResult(validatedOrder, List.of(), consistencyResult);
        }

        Result<List<OrderItem>> itemsResult = compensationPlanner.resolveOrderItems(validatedOrder, request.getOrderItemIds());
        if (itemsResult.isError()) {
            return new CancellationValidationResult(
                    validatedOrder,
                    List.of(),
                    itemsResult.propagateError()
            );
        }

        List<OrderItem> itemsToCancel = itemsResult.getData();

        Result<Void> itemsValidationResult = compensationPlanner.validateCancellableItems(itemsToCancel);
        if (itemsValidationResult.isError()) {
            return new CancellationValidationResult(validatedOrder, itemsToCancel, itemsValidationResult);
        }

        return new CancellationValidationResult(
                validatedOrder,
                itemsToCancel,
                Result.<Void>success()
        );
    }
}


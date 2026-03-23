package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderCancellationService {

    private final OrderRepository orderRepository;
    private final OrderItemCompensationPlanner compensationPlanner;
    private final OrderCancellationValidationService validationService;
    private final OrderCancellationPersistenceService persistenceService;
    private final OrderCancellationRefundService refundService;
    private final OrderCancellationFinalizationService finalizationService;

    public Result<OrderDto> cancelOrder(Long orderId, OrderCancelRequest request, User user) {
        Order orderStub = new Order();
        orderStub.setId(orderId);

        CancellationValidationResult validation = validationService.validate(orderStub, request, user);
        if (validation.validationResult().isError()) {
            return validation.validationResult().propagateError();
        }

        Order order = validation.validatedOrder();
        List<OrderItem> itemsToCancel = validation.cancellableItems();

        OrderItemCompensationPlanner.CancellationPlan cancellationPlan =
                compensationPlanner.buildCancellationPlan(itemsToCancel, request);
        BigDecimal totalRefundAmount = cancellationPlan.totalRefundAmount();
        List<OrderItemCancel> cancelRecords = cancellationPlan.records();

        if (cancelRecords.isEmpty()) {
            return Result.error(OrderErrorCodes.ORDER_ITEM_ALREADY_CANCELLED);
        }

        persistenceService.persist(cancelRecords, order);

        try {
            refundService.processRefund(cancelRecords, totalRefundAmount, order);
        } catch (OrderCancellationRefundService.RefundFailedException e) {
            return Result.error(OrderCancellationRefundService.getRefundFailedMessage(),
                    OrderCancellationRefundService.getRefundFailedCode());
        }

        return orderRepository.findByIdWithOrderItems(order.getId())
                .map(refreshedOrder -> finalizationService.finalize(refreshedOrder, user).result())
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }

}

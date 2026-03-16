package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OrderRefundWorkflowSupport {

    private final OrderRepository orderRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;
    private final OrderEscrowService orderEscrowService;
    private final OrderStockService orderStockService;

    public void persistRefundRecordsAndRestoreStock(List<OrderItemRefund> refundRecords) {
        orderItemRefundRepository.saveAll(refundRecords);
        refundRecords.forEach(record ->
                orderStockService.restoreStock(record.getOrderItem(), record.getRefundedQuantity()));
        orderRepository.flush();
    }

    public List<OrderItemEscrow> resolveEscrowsToRefund(List<OrderItem> itemsToRefund) {
        return itemsToRefund.stream()
                .map(orderEscrowService::findEscrowByOrderItem)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
    }

    public Result<Order> reloadOrderWithItems(Long orderId) {
        Order order = orderRepository.findByIdWithOrderItems(orderId).orElse(null);
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }
        return Result.success(order);
    }

    public Result<Order> saveOrderAndReload(Order order) {
        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();
        return reloadOrderWithItems(savedOrder.getId());
    }
}

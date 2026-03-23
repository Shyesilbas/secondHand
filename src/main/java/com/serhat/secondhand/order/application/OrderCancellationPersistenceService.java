package com.serhat.secondhand.order.application;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCancellationPersistenceService {

    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderStockService orderStockService;
    private final OrderRepository orderRepository;

    public void persist(List<OrderItemCancel> cancelRecords, Order order) {
        orderItemCancelRepository.saveAll(cancelRecords);
        cancelRecords.forEach(record ->
                orderStockService.restoreStock(record.getOrderItem(), record.getCancelledQuantity()));
        orderRepository.flush();
    }
}


package com.serhat.secondhand.shipping;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingService {

    private final OrderRepository orderRepository;


    public ShippingStatus calculateShippingStatus(Order order) {
        if (order.getCreatedAt() == null) {
            return ShippingStatus.PENDING;
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(order.getCreatedAt(), now);

        ShippingStatus newStatus;
        if (duration.toHours() < 3) {
            newStatus = ShippingStatus.PENDING;
        } else if (duration.toHours() < 24) {
            newStatus = ShippingStatus.IN_TRANSIT;
        } else {
            newStatus = ShippingStatus.DELIVERED;
        }

        if (order.getShippingStatus() != newStatus) {
            order.setShippingStatus(newStatus);
            orderRepository.save(order);
            log.info("Shipping status updated for order {}: {}", order.getOrderNumber(), newStatus);
        }

        return newStatus;
    }


    public List<Order> updateShippingStatusesForOrders(List<Order> orders) {
        orders.forEach(this::calculateShippingStatus);
        return orders;
    }
}

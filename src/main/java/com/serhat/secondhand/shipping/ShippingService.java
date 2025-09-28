package com.serhat.secondhand.shipping;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.order.repository.OrderRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingService {

    private final OrderRepository orderRepository;

    @Getter
    @Value("${app.shipping.pickup.duration.hours}")
    private Integer pickupDurationHours;

    @Getter
    @Value("${app.shipping.delivery.duration.hours}")
    private Integer deliveryDurationHours;


    public ShippingStatus calculateShippingStatus(Order order) {
        if (order.getCreatedAt() == null) {
            return ShippingStatus.PENDING;
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(order.getCreatedAt(), now);

        ShippingStatus newStatus;
        if (duration.toHours() < pickupDurationHours) {
            newStatus = ShippingStatus.PENDING;
        } else if (duration.toHours() < deliveryDurationHours) {
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


    public void updateShippingStatusesForOrders(List<Order> orders) {
        orders.forEach(this::calculateShippingStatus);
    }

}

package com.serhat.secondhand.order.application.event;

import com.serhat.secondhand.order.entity.Order;

public record OrderStatusChangedEvent(Order order, String oldStatus, String newStatus) {
}

package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.order.entity.enums.OrderStatus;

/**
 * Number of orders in one status for the current buyer or seller list (used for list tab badges).
 */
public record OrderStatusCountDto(OrderStatus status, Long count) {
}

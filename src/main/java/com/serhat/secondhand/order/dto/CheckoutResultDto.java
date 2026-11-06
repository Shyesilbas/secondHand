package com.serhat.secondhand.order.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Result of one checkout: one order per seller, and the amount charged across all of them.
 */
public record CheckoutResultDto(List<OrderDto> orders, BigDecimal totalAmount) {
}

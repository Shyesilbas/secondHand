package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.user.domain.dto.AddressDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {

    private Long id;
    private String orderNumber;
    private Long userId;
    private Order.OrderStatus status;
    private BigDecimal totalAmount;
    private String currency;
    private AddressDto shippingAddress;
    private AddressDto billingAddress;
    private String notes;
    private String paymentReference;
    private Order.PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDto> orderItems;
    private ShippingStatus shippingStatus;
    private LocalDateTime estimatedTransitDate;
    private LocalDateTime estimatedDeliveryDate;
}

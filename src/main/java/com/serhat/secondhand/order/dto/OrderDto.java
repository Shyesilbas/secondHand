package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.payment.entity.PaymentType;
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
    private String name;
    private Long userId;
    private String buyerName;
    private String buyerSurname;
    private String buyerEmail;
    private Order.OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal campaignDiscount;
    private String couponCode;
    private BigDecimal couponDiscount;
    private BigDecimal discountTotal;
    private String currency;
    private AddressDto shippingAddress;
    private AddressDto billingAddress;
    private String notes;
    private String paymentReference;
    private Order.PaymentStatus paymentStatus;
    private PaymentType paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDto> orderItems;
    private ShippingDto shipping;
    private java.math.BigDecimal escrowAmount;
}

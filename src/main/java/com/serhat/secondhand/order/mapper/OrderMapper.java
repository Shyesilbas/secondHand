package com.serhat.secondhand.order.mapper;

import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.user.domain.mapper.AddressMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ListingMapper listingMapper;
    private final AddressMapper addressMapper;

    public OrderDto toDto(Order order) {
        if (order == null) {
            return null;
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .shippingAddress(addressMapper.toDto(order.getShippingAddress()))
                .billingAddress(order.getBillingAddress() != null ? addressMapper.toDto(order.getBillingAddress()) : null)
                .notes(order.getNotes())
                .paymentReference(order.getPaymentReference())
                .paymentStatus(order.getPaymentStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(orderItemsToDtoList(order.getOrderItems()))
                .build();
    }

    public List<OrderDto> toDtoList(List<Order> orders) {
        if (orders == null) {
            return null;
        }

        return orders.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private List<OrderItemDto> orderItemsToDtoList(List<OrderItem> orderItems) {
        if (orderItems == null) {
            return null;
        }

        return orderItems.stream()
                .map(this::orderItemToDto)
                .collect(Collectors.toList());
    }

    private OrderItemDto orderItemToDto(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }

        return OrderItemDto.builder()
                .id(orderItem.getId())
                .orderId(orderItem.getOrder().getId())
                .listing(listingMapper.toDynamicDto(orderItem.getListing()))
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .totalPrice(orderItem.getTotalPrice())
                .currency(orderItem.getCurrency())
                .notes(orderItem.getNotes())
                .createdAt(orderItem.getCreatedAt())
                .build();
    }
}

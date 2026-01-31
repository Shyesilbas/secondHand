package com.serhat.secondhand.order.mapper;

import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
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
    private final ShippingMapper shippingMapper;
    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;

    public OrderDto toDto(Order order) {
        if (order == null) {
            return null;
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .name(order.getName())
                .userId(order.getUser().getId())
                .buyerName(order.getUser().getName())
                .buyerSurname(order.getUser().getSurname())
                .buyerEmail(order.getUser().getEmail())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .campaignDiscount(order.getCampaignDiscount())
                .couponCode(order.getCouponCode())
                .couponDiscount(order.getCouponDiscount())
                .discountTotal(order.getDiscountTotal())
                .currency(order.getCurrency())
                .shippingAddress(addressMapper.toDto(order.getShippingAddress()))
                .billingAddress(order.getBillingAddress() != null ? addressMapper.toDto(order.getBillingAddress()) : null)
                .notes(order.getNotes())
                .paymentReference(order.getPaymentReference())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(orderItemsToDtoList(order.getOrderItems()))
                .shipping(shippingMapper.toDto(order.getShipping()))
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

        Integer cancelledQuantity = orderItemCancelRepository.sumCancelledQuantityByOrderItem(orderItem);
        Integer refundedQuantity = orderItemRefundRepository.sumRefundedQuantityByOrderItem(orderItem);

        String sellerName = null;
        String sellerSurname = null;
        if (orderItem.getListing() != null && orderItem.getListing().getSeller() != null) {
            sellerName = orderItem.getListing().getSeller().getName();
            sellerSurname = orderItem.getListing().getSeller().getSurname();
        }

        return OrderItemDto.builder()
                .id(orderItem.getId())
                .orderId(orderItem.getOrder().getId())
                .listing(listingMapper.toDynamicDto(orderItem.getListing()))
                .sellerName(sellerName)
                .sellerSurname(sellerSurname)
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .totalPrice(orderItem.getTotalPrice())
                .currency(orderItem.getCurrency())
                .notes(orderItem.getNotes())
                .createdAt(orderItem.getCreatedAt())
                .cancelledQuantity(cancelledQuantity != null && cancelledQuantity > 0 ? cancelledQuantity : null)
                .refundedQuantity(refundedQuantity != null && refundedQuantity > 0 ? refundedQuantity : null)
                .build();
    }
}

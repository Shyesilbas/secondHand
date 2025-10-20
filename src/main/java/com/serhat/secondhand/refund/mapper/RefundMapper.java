package com.serhat.secondhand.refund.mapper;

import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.refund.dto.RefundRequestDto;
import com.serhat.secondhand.refund.entity.RefundRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class RefundMapper {

    private final ListingMapper listingMapper;

    public RefundRequestDto toDto(RefundRequest refundRequest) {
        if (refundRequest == null) {
            return null;
        }

        boolean canCancel = refundRequest.getCreatedAt() != null &&
                ChronoUnit.HOURS.between(refundRequest.getCreatedAt(), LocalDateTime.now()) < 1;

        return RefundRequestDto.builder()
                .id(refundRequest.getId())
                .refundNumber(refundRequest.getRefundNumber())
                .orderId(refundRequest.getOrder().getId())
                .orderNumber(refundRequest.getOrder().getOrderNumber())
                .orderItem(toOrderItemDto(refundRequest.getOrderItem()))
                .userId(refundRequest.getUser().getId())
                .status(refundRequest.getStatus())
                .refundAmount(refundRequest.getRefundAmount())
                .currency(refundRequest.getCurrency())
                .reason(refundRequest.getReason())
                .refundMethod(refundRequest.getRefundMethod())
                .refundReference(refundRequest.getRefundReference())
                .adminNotes(refundRequest.getAdminNotes())
                .createdAt(refundRequest.getCreatedAt())
                .updatedAt(refundRequest.getUpdatedAt())
                .processedAt(refundRequest.getProcessedAt())
                .completedAt(refundRequest.getCompletedAt())
                .canCancel(canCancel)
                .build();
    }

    private OrderItemDto toOrderItemDto(OrderItem orderItem) {
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
                .shippingStatus(orderItem.getOrder().getShippingStatus())
                .build();
    }
}


package com.serhat.secondhand.refund.dto;

import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.refund.entity.RefundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDto {

    private Long id;
    private String refundNumber;
    private Long orderId;
    private String orderNumber;
    private OrderItemDto orderItem;
    private Long userId;
    private RefundStatus status;
    private BigDecimal refundAmount;
    private String currency;
    private String reason;
    private PaymentType refundMethod;
    private String refundReference;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime processedAt;
    private LocalDateTime completedAt;
    private Boolean canCancel; // Kullanıcı 1 saat içinde mi?
}



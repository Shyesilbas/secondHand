package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentDto(
        UUID paymentId,
        String senderDisplayName,
        String receiverDisplayName,
        BigDecimal amount,
        String currency,
        PaymentType paymentType,
        PaymentTransactionType transactionType,
        PaymentDirection paymentDirection,
        UUID listingId,
        String listingTitle,
        String listingNo,
        LocalDateTime processedAt,
        PaymentStatus status,
        boolean isSuccess
) {
}

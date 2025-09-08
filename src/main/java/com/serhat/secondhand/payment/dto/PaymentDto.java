package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentDto(
        UUID paymentId,
        String senderName,
        String senderSurname,
        String receiverName,
        String receiverSurname,
        BigDecimal amount,
        PaymentType paymentType,
        PaymentTransactionType transactionType,
        PaymentDirection paymentDirection,
        UUID listingId,
        String listingTitle,
        String listingNo,
        LocalDateTime createdAt,
        boolean isSuccess
) {
}

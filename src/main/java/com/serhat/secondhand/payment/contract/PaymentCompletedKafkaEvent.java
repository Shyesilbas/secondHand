package com.serhat.secondhand.payment.contract;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentCompletedKafkaEvent(
        UUID paymentId,
        String idempotencyKey,
        Long fromUserId,
        String fromUserEmail,
        Long toUserId,
        String toUserEmail,
        BigDecimal amount,
        String currency,
        String providerName,
        UUID listingId,
        Long orderItemId,
        Integer quantity,
        String status,
        LocalDateTime completedAt
) {}

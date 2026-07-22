package com.serhat.secondhand.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResult(
        boolean success,
        String transactionId,
        BigDecimal amount,
        String providerName,
        String errorMessage,
        LocalDateTime processedAt,
        UUID listingId,
        Long fromUserId,
        Long toUserId
) {
    public static PaymentResult success(String transactionId, BigDecimal amount, String providerName, UUID listingId, Long fromUserId, Long toUserId) {
        return new PaymentResult(true, transactionId, amount, providerName, null, LocalDateTime.now(), listingId, fromUserId, toUserId);
    }
    public static PaymentResult failure(String errorMessage, BigDecimal amount, String providerName, UUID listingId, Long fromUserId, Long toUserId) {
        return new PaymentResult(false, null, amount, providerName, errorMessage, LocalDateTime.now(), listingId, fromUserId, toUserId);
    }
}

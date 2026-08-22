package com.serhat.secondhand.escrow.contract;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record EscrowReleasedKafkaEvent(
        Long escrowId,
        Long orderId,
        String orderNumber,
        Long orderItemId,
        UUID listingId,
        Long sellerId,
        String sellerEmail,
        Long buyerId,
        String buyerEmail,
        BigDecimal amount,
        String currency,
        LocalDateTime releasedAt
) {}

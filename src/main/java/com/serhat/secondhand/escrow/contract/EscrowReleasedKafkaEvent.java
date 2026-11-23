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
        /** Seller payout: buyer-paid amount plus platform coupon share minus commission. */
        BigDecimal amount,
        BigDecimal platformSubsidy,
        BigDecimal commissionAmount,
        /** Seller-carried shipping fee share withheld from the payout and credited to the system account. */
        BigDecimal shippingDeduction,
        String currency,
        LocalDateTime releasedAt
) {}

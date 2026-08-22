package com.serhat.secondhand.order.contract;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderRefundedKafkaEvent(
        Long orderId,
        String orderNumber,
        Long buyerId,
        BigDecimal totalRefundAmount,
        List<RefundedItemDetail> refundedItems,
        String reason
) {
    public record RefundedItemDetail(
            UUID listingId,
            Integer quantity,
            BigDecimal totalPrice
    ) {}
}

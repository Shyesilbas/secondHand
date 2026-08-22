package com.serhat.secondhand.order.contract;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderCancelledKafkaEvent(
        Long orderId,
        String orderNumber,
        Long buyerId,
        BigDecimal refundAmount,
        List<CancelledItemDetail> cancelledItems,
        String reason
) {
    public record CancelledItemDetail(
            UUID listingId,
            Integer quantity,
            BigDecimal price
    ) {}
}

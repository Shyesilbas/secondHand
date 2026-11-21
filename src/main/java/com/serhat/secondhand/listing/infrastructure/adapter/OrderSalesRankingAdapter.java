package com.serhat.secondhand.listing.infrastructure.adapter;

import com.serhat.secondhand.listing.application.port.ListingSalesRankingPort;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** A sale counts when the order is paid and was not cancelled or refunded, matching the great-seller rule. */
@Component
@RequiredArgsConstructor
public class OrderSalesRankingAdapter implements ListingSalesRankingPort {

    private static final Set<OrderStatus> EXCLUDED_ORDER_STATUSES = EnumSet.of(OrderStatus.CANCELLED, OrderStatus.REFUNDED);

    private final OrderItemRepository orderItemRepository;

    @Override
    public List<UUID> findTopSellingActiveListingIds(int limit) {
        return orderItemRepository.findTopSellingListingIds(
                PaymentStatus.COMPLETED,
                EXCLUDED_ORDER_STATUSES,
                ListingStatus.ACTIVE,
                PageRequest.of(0, limit));
    }
}

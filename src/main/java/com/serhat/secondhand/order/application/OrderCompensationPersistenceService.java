package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderCompensationPersistenceService {

    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final OrderLogService orderLog;

    public void persistCancellationRecordsAndRestoreStock(List<OrderItemCancel> cancelRecords) {
        orderItemCancelRepository.saveAll(cancelRecords);
        cancelRecords.forEach(record -> restoreStock(record.getOrderItem(), record.getCancelledQuantity()));
        orderRepository.flush();
    }

    public void persistRefundRecordsAndRestoreStock(List<OrderItemRefund> refundRecords) {
        orderItemRefundRepository.saveAll(refundRecords);
        refundRecords.forEach(record -> restoreStock(record.getOrderItem(), record.getRefundedQuantity()));
        orderRepository.flush();
    }

    public Result<Order> reloadOrderWithItems(Long orderId) {
        Order order = orderRepository.findByIdWithOrderItems(orderId).orElse(null);
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }
        return Result.success(order);
    }

    public Result<Order> saveOrderAndReload(Order order) {
        Order savedOrder = orderRepository.save(order);
        orderRepository.flush();
        return reloadOrderWithItems(savedOrder.getId());
    }

    private void restoreStock(OrderItem item, int delta) {
        if (item == null || delta <= 0) return;
        Listing listing = item.getListing();
        if (listing == null) return;
        ListingType type = item.getListingType();
        if (type == ListingType.REAL_ESTATE || type == ListingType.VEHICLE) return;
        if (listing.getQuantity() == null) return;
        listingRepository.incrementQuantity(listing.getId(), delta);
        orderLog.logStockRestored(listing.getId(), delta);
    }
}

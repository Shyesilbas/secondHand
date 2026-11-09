package com.serhat.secondhand.order.application.listener;

import com.serhat.secondhand.notification.application.INotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.application.event.OrderCancelledEvent;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.application.event.OrderCreatedEvent;
import com.serhat.secondhand.order.application.event.OrderRefundedEvent;
import com.serhat.secondhand.order.application.event.OrderStatusChangedEvent;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationListener {

    private final INotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;
    private final OrderMapper orderMapper;
    private final OrderLogService orderLog;
    private final OrderRepository orderRepository;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreated(OrderCreatedEvent event) {
        if (!event.paymentSuccessful()) {
            return;
        }
        try {
            OrderDto orderDto = orderMapper.toDto(event.order());
            sendBuyerInAppNotification(event.buyer().getId(), orderDto);
            sendSellerInAppNotifications(orderDto);
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderCreatedInApp", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCancelled(OrderCancelledEvent event) {
        if (event.shipDeadlineMissed()) {
            notifyShipDeadlineCancellation(event);
            return;
        }
        try {
            Optional<Order> loaded = orderRepository.findByIdWithOrderItemsAndSellers(event.order().getId());
            Order order = loaded.orElse(event.order());
            OrderItemSummary summary = summarizeOrder(order);

            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderCancelled(
                            event.requester().getId(),
                            order.getId(),
                            order.getOrderNumber(),
                            summary.listingId(),
                            summary.listingTitle(),
                            summary.itemCount()
                    )
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("orderCancelledInApp", order.getOrderNumber(), result.getMessage());
            }

            Set<Long> counterparties = collectOrderParticipantIds(order);
            counterparties.remove(event.requester().getId());
            for (Long uid : counterparties) {
                var cr = notificationService.createAndSend(
                        notificationTemplateCatalog.orderCancelledCounterparty(
                                uid,
                                order.getId(),
                                order.getOrderNumber(),
                                summary.listingId(),
                                summary.listingTitle(),
                                summary.itemCount()
                        )
                );
                if (cr.isError()) {
                    orderLog.logNotificationFailed("orderCancelledCounterpartyInApp", order.getOrderNumber(), cr.getMessage());
                }
            }
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderCancelledInApp", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCompleted(OrderCompletedEvent event) {
        try {
            Order order = orderRepository.findByIdWithOrderItemsAndSellers(event.order().getId()).orElse(event.order());
            OrderItemSummary summary = summarizeOrder(order);
            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderCompleted(
                            event.buyer().getId(),
                            order.getId(),
                            order.getOrderNumber(),
                            summary.listingId(),
                            summary.listingTitle(),
                            summary.itemCount(),
                            summary.totalAmount(),
                            summary.currency()
                    )
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("orderCompletedInApp", order.getOrderNumber(), result.getMessage());
            }
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderCompletedInApp", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderRefunded(OrderRefundedEvent event) {
        try {
            Order order = orderRepository.findByIdWithOrderItemsAndSellers(event.order().getId()).orElse(event.order());
            OrderItemSummary summary = summarizeOrder(order);
            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderRefunded(
                            event.buyer().getId(),
                            order.getId(),
                            order.getOrderNumber(),
                            summary.listingId(),
                            summary.listingTitle(),
                            summary.itemCount(),
                            summary.totalAmount(),
                            summary.currency()
                    )
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("orderRefundedInApp", order.getOrderNumber(), result.getMessage());
            }
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderRefundedInApp", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        if ("COMPLETED".equalsIgnoreCase(event.newStatus())) {
            // OrderCompletedEvent already dispatches the dedicated ORDER_COMPLETED notification.
            return;
        }
        try {
            Order order = orderRepository.findByIdWithOrderItemsAndSellers(event.order().getId()).orElse(event.order());
            OrderItemSummary summary = summarizeOrder(order);
            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderStatusChanged(
                            order.getUser().getId(),
                            order.getId(),
                            order.getOrderNumber(),
                            event.oldStatus(),
                            event.newStatus(),
                            summary.listingId(),
                            summary.listingTitle(),
                            summary.itemCount()
                    )
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("orderStatusChangedInApp", order.getOrderNumber(), result.getMessage());
            }
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderStatusChangedInApp", event.order().getOrderNumber(), e.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    // Nobody "cancelled" this order: the buyer is told about the refund, each seller about the missed deadline.
    private void notifyShipDeadlineCancellation(OrderCancelledEvent event) {
        String orderNumber = event.order().getOrderNumber();
        try {
            Order order = orderRepository.findByIdWithOrderItemsAndSellers(event.order().getId()).orElse(event.order());
            OrderItemSummary summary = summarizeOrder(order);
            Long buyerId = order.getUser() != null ? order.getUser().getId() : null;
            for (Long uid : collectOrderParticipantIds(order)) {
                var result = notificationService.createAndSend(
                        notificationTemplateCatalog.orderCancelledShipDeadline(
                                uid, order.getId(), orderNumber,
                                OrderBusinessConstants.SHIP_DEADLINE_HOURS, !uid.equals(buyerId),
                                summary.listingId(), summary.listingTitle(), summary.itemCount()));
                if (result.isError()) {
                    orderLog.logNotificationFailed("orderShipDeadlineCancelledInApp", orderNumber, result.getMessage());
                }
            }
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderShipDeadlineCancelledInApp", orderNumber, e.getMessage());
        }
    }

    private static Set<Long> collectOrderParticipantIds(Order order) {
        Set<Long> ids = new LinkedHashSet<>();
        if (order.getUser() != null && order.getUser().getId() != null) {
            ids.add(order.getUser().getId());
        }
        if (order.getOrderItems() != null) {
            for (OrderItem oi : order.getOrderItems()) {
                if (oi.getSeller() != null && oi.getSeller().getId() != null) {
                    ids.add(oi.getSeller().getId());
                }
            }
        }
        return ids;
    }

    private void sendBuyerInAppNotification(Long buyerId, OrderDto orderDto) {
        List<OrderItemDto> items = orderDto.getOrderItems();
        OrderItemDto firstItem = (items != null && !items.isEmpty()) ? items.get(0) : null;
        String listingTitle = firstItem != null && firstItem.getListing() != null ? firstItem.getListing().getTitle() : null;
        UUID listingId = firstItem != null && firstItem.getListing() != null ? firstItem.getListing().getId() : null;
        Integer itemCount = items != null ? items.size() : null;
        String totalAmount = orderDto.getTotalAmount() != null ? orderDto.getTotalAmount().toPlainString() : null;
        String currency = orderDto.getCurrency() != null ? orderDto.getCurrency().name() : "TRY";

        var result = notificationService.createAndSend(
                notificationTemplateCatalog.orderCreated(
                        buyerId, orderDto.getId(), orderDto.getOrderNumber(),
                        listingId, listingTitle, itemCount, totalAmount, currency)
        );
        if (result.isError()) {
            orderLog.logNotificationFailed("buyerOrderCreatedInApp", orderDto.getOrderNumber(), result.getMessage());
        }
    }

    private void sendSellerInAppNotifications(OrderDto orderDto) {
        if (orderDto.getOrderItems() == null || orderDto.getOrderItems().isEmpty()) {
            return;
        }

        Map<Long, List<OrderItemDto>> itemsBySeller = orderDto.getOrderItems().stream()
                .filter(item -> item.getListing() != null && item.getListing().getSellerId() != null)
                .collect(Collectors.groupingBy(item -> item.getListing().getSellerId()));

        for (Map.Entry<Long, List<OrderItemDto>> entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<OrderItemDto> sellerItems = entry.getValue();

            OrderItemDto firstItem = sellerItems.isEmpty() ? null : sellerItems.get(0);
            String listingTitle = firstItem != null && firstItem.getListing() != null ? firstItem.getListing().getTitle() : null;
            UUID listingId = firstItem != null && firstItem.getListing() != null ? firstItem.getListing().getId() : null;
            String totalAmount = orderDto.getTotalAmount() != null ? orderDto.getTotalAmount().toPlainString() : null;
            String currency = orderDto.getCurrency() != null ? orderDto.getCurrency().name() : "TRY";

            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderReceived(
                            sellerId, orderDto.getId(), orderDto.getOrderNumber(),
                            listingId, listingTitle, sellerItems.size(), totalAmount, currency)
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("sellerOrderReceivedInApp", orderDto.getOrderNumber(), result.getMessage());
            }
        }
    }

    private record OrderItemSummary(UUID listingId, String listingTitle, Integer itemCount, String totalAmount, String currency) {}

    private static OrderItemSummary summarizeOrder(Order order) {
        if (order == null) {
            return new OrderItemSummary(null, null, null, null, null);
        }
        List<OrderItem> items = order.getOrderItems();
        OrderItem first = (items != null && !items.isEmpty()) ? items.get(0) : null;
        UUID listingId = (first != null && first.getListing() != null) ? first.getListing().getId() : null;
        String listingTitle = (first != null && first.getListing() != null) ? first.getListing().getTitle() : null;
        Integer count = items != null ? items.size() : null;
        String totalAmount = order.getTotalAmount() != null ? order.getTotalAmount().toPlainString() : null;
        String currency = order.getCurrency() != null ? order.getCurrency().name() : "TRY";
        return new OrderItemSummary(listingId, listingTitle, count, totalAmount, currency);
    }
}

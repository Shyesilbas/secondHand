package com.serhat.secondhand.order.application.listener;

import com.serhat.secondhand.notification.application.INotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.application.event.OrderCancelledEvent;
import com.serhat.secondhand.order.application.event.OrderCreatedEvent;
import com.serhat.secondhand.order.application.event.OrderStatusChangedEvent;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;
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
        try {
            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderCancelled(
                            event.requester().getId(),
                            event.order().getId(),
                            event.order().getOrderNumber()
                    )
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("orderCancelledInApp", event.order().getOrderNumber(), result.getMessage());
            }
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderCancelledInApp", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        try {
            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderStatusChanged(
                            event.order().getUser().getId(),
                            event.order().getId(),
                            event.order().getOrderNumber(),
                            event.oldStatus(),
                            event.newStatus()
                    )
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("orderStatusChangedInApp", event.order().getOrderNumber(), result.getMessage());
            }
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderStatusChangedInApp", event.order().getOrderNumber(), e.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void sendBuyerInAppNotification(Long buyerId, OrderDto orderDto) {
        var result = notificationService.createAndSend(
                notificationTemplateCatalog.orderCreated(buyerId, orderDto.getId(), orderDto.getOrderNumber())
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

            var result = notificationService.createAndSend(
                    notificationTemplateCatalog.orderReceived(sellerId, orderDto.getId(), orderDto.getOrderNumber(), listingId, listingTitle)
            );
            if (result.isError()) {
                orderLog.logNotificationFailed("sellerOrderReceivedInApp", orderDto.getOrderNumber(), result.getMessage());
            }
        }
    }
}

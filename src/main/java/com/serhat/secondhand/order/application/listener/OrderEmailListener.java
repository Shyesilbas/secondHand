package com.serhat.secondhand.order.application.listener;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.application.event.OrderCancelledEvent;
import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.application.event.OrderCreatedEvent;
import com.serhat.secondhand.order.application.event.OrderRefundedEvent;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEmailListener {

    private final EmailService emailService;
    private final EmailConfig emailConfig;
    private final OrderMapper orderMapper;
    private final IUserService userService;
    private final OrderLogService orderLog;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreated(OrderCreatedEvent event) {
        if (!event.paymentSuccessful()) {
            return;
        }
        try {
            OrderDto orderDto = orderMapper.toDto(event.order());
            sendCustomerConfirmationEmail(event.buyer(), orderDto);
            sendSellerNotificationEmails(orderDto);
            orderLog.logNotificationSent("orderCreatedEmail", event.order().getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderCreatedEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCancelled(OrderCancelledEvent event) {
        try {
            Order order = event.order();
            String content = buildCancellationContent(event.requester(), order);
            emailService.sendEmail(event.requester(), emailConfig.getOrder().getCancelledSubject(), content, EmailType.NOTIFICATION);
            orderLog.logNotificationSent("orderCancelledEmail", order.getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderCancelledEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCompleted(OrderCompletedEvent event) {
        try {
            Order order = event.order();
            String content = buildCompletionContent(event.buyer(), order, event.isAutomatic());
            emailService.sendEmail(event.buyer(), emailConfig.getOrder().getCompletedSubject(), content, EmailType.NOTIFICATION);
            orderLog.logNotificationSent("orderCompletedEmail", order.getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderCompletedEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderRefunded(OrderRefundedEvent event) {
        try {
            Order order = event.order();
            String content = buildRefundContent(event.buyer(), order);
            emailService.sendEmail(event.buyer(), emailConfig.getOrder().getRefundedSubject(), content, EmailType.NOTIFICATION);
            orderLog.logNotificationSent("orderRefundedEmail", order.getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderRefundedEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void sendCustomerConfirmationEmail(User customer, OrderDto orderDto) {
        try {
            String subject = emailConfig.getOrderConfirmationSubject();
            String content = buildOrderConfirmationContent(customer, orderDto);
            emailService.sendEmail(customer, subject, content, EmailType.NOTIFICATION);
            orderLog.logNotificationSent("customerConfirmationEmail", orderDto.getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("customerConfirmationEmail", orderDto.getOrderNumber(), e.getMessage());
        }
    }

    private void sendSellerNotificationEmails(OrderDto orderDto) {
        if (orderDto.getOrderItems() == null || orderDto.getOrderItems().isEmpty()) {
            orderLog.logDataWarning("No order items found for seller email notifications in order: {}", orderDto.getOrderNumber());
            return;
        }

        Map<Long, List<OrderItemDto>> itemsBySeller = orderDto.getOrderItems().stream()
                .filter(item -> item.getListing() != null && item.getListing().getSellerId() != null)
                .collect(Collectors.groupingBy(item -> item.getListing().getSellerId()));

        for (Map.Entry<Long, List<OrderItemDto>> entry : itemsBySeller.entrySet()) {
            sendSellerEmail(entry.getKey(), orderDto, entry.getValue());
        }
    }

    private void sendSellerEmail(Long sellerId, OrderDto orderDto, List<OrderItemDto> sellerItems) {
        try {
            var sellerResult = userService.findById(sellerId);
            if (sellerResult.isError() || sellerResult.getData() == null) {
                orderLog.logDataWarning("Seller not found for ID: {}", sellerId);
                return;
            }
            User seller = sellerResult.getData();
            String subject = emailConfig.getSaleNotificationSubject();
            String content = buildSaleNotificationContent(seller, orderDto, sellerItems);
            emailService.sendEmail(seller, subject, content, EmailType.NOTIFICATION);
            orderLog.logNotificationSent("sellerSaleEmail", orderDto.getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("sellerSaleEmail", orderDto.getOrderNumber(), e.getMessage());
        }
    }

    private String buildOrderConfirmationContent(User user, OrderDto order) {
        EmailConfig.Order cfg = emailConfig.getOrder();
        StringBuilder sb = new StringBuilder();
        sb.append(String.format(cfg.getCustomerGreetingFormat(), user.getName())).append("\n\n");
        sb.append(cfg.getCustomerIntroLine()).append("\n\n");
        sb.append(cfg.getCustomerOrderNumberLabel()).append(": **").append(getOrderDisplayName(order.getName(), order.getOrderNumber())).append("**\n");
        sb.append(cfg.getCustomerStatusLabel()).append(": **").append(order.getStatus()).append("**\n");
        sb.append(cfg.getCustomerPaymentStatusLabel()).append(": **").append(order.getPaymentStatus()).append("**\n");
        sb.append(cfg.getCustomerTotalLabel()).append(": **").append(order.getTotalAmount()).append(' ').append(order.getCurrency()).append("**\n");

        if (order.getShippingAddress() != null) {
            sb.append("\n**").append(cfg.getCustomerShippingAddressLabel()).append("**:\n");
            sb.append(order.getShippingAddress().getAddressLine()).append('\n');
            sb.append(order.getShippingAddress().getCity()).append(' ')
              .append(order.getShippingAddress().getState()).append(' ')
              .append(order.getShippingAddress().getPostalCode()).append('\n');
            sb.append(order.getShippingAddress().getCountry()).append('\n');
        }

        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            sb.append("\n**").append(cfg.getCustomerItemsLabel()).append("**:\n");
            order.getOrderItems().forEach(it -> {
                String title = it.getListing() != null ? it.getListing().getTitle() : cfg.getCustomerItemFallbackTitle();
                sb.append(String.format(
                        cfg.getCustomerItemLineFormat(),
                        title,
                        it.getQuantity(),
                        it.getTotalPrice(),
                        order.getCurrency()
                )).append('\n');
            });
        }

        if (order.getNotes() != null && !order.getNotes().isBlank()) {
            sb.append("\n**").append(cfg.getCustomerNotesLabel()).append("**: ").append(order.getNotes()).append('\n');
        }
        if (order.getPaymentReference() != null) {
            sb.append("**").append(cfg.getCustomerPaymentReferenceLabel()).append("**: ").append(order.getPaymentReference()).append('\n');
        }
        sb.append("\n").append(cfg.getCustomerClosing()).append('\n');
        return sb.toString();
    }

    private String buildSaleNotificationContent(User seller, OrderDto order, List<OrderItemDto> sellerItems) {
        EmailConfig.Order cfg = emailConfig.getOrder();
        StringBuilder sb = new StringBuilder();
        sb.append(String.format(cfg.getSellerGreetingFormat(), seller.getName())).append("\n\n");
        sb.append(cfg.getSellerIntroLine()).append("\n\n");
        sb.append(cfg.getSellerOrderNumberLabel()).append(": **").append(getOrderDisplayName(order.getName(), order.getOrderNumber())).append("**\n");

        BigDecimal total = sellerItems.stream()
                .map(OrderItemDto::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        sb.append(cfg.getSellerTotalAmountLabel()).append(": **").append(total).append(' ').append(order.getCurrency()).append("**\n\n");

        sb.append("**").append(cfg.getSellerSoldItemsLabel()).append("**:\n");
        sellerItems.forEach(item -> {
            String title = item.getListing() != null ? item.getListing().getTitle() : cfg.getSellerItemFallbackTitle();
            sb.append(String.format(
                    cfg.getSellerItemLineFormat(),
                    title,
                    item.getQuantity(),
                    item.getTotalPrice(),
                    order.getCurrency()
            )).append('\n');
        });

        if (order.getShippingAddress() != null) {
            sb.append("\n**").append(cfg.getSellerShippingAddressLabel()).append("**:\n");
            sb.append(order.getShippingAddress().getAddressLine()).append('\n');
            sb.append(order.getShippingAddress().getCity()).append(' ')
              .append(order.getShippingAddress().getState()).append(' ')
              .append(order.getShippingAddress().getPostalCode()).append('\n');
            sb.append(order.getShippingAddress().getCountry()).append('\n');
        }

        sb.append("\n*").append(cfg.getSellerPrepLine()).append("*\n\n");
        sb.append(cfg.getSellerClosing()).append('\n');
        return sb.toString();
    }

    private String buildCancellationContent(User user, Order order) {
        return String.format(emailConfig.getOrder().getCancellationContentFormat(), user.getName(), "**" + getOrderDisplayName(order.getName(), order.getOrderNumber()) + "**");
    }

    private String buildRefundContent(User user, Order order) {
        return String.format(emailConfig.getOrder().getRefundContentFormat(), user.getName(), "**" + getOrderDisplayName(order.getName(), order.getOrderNumber()) + "**");
    }

    private String buildCompletionContent(User user, Order order, boolean isAutomatic) {
        String completionWord = isAutomatic
                ? emailConfig.getOrder().getCompletionAutomaticWord()
                : emailConfig.getOrder().getCompletionManualWord();
        return String.format(emailConfig.getOrder().getCompletionContentFormat(), user.getName(), "**" + getOrderDisplayName(order.getName(), order.getOrderNumber()) + "**", completionWord);
    }

    private String getOrderDisplayName(String orderName, String orderNumber) {
        if (orderName != null && !orderName.trim().isEmpty()) {
            return orderName;
        }
        if (orderNumber != null) {
            String cleanNumber = orderNumber.replace("-", "").toUpperCase();
            return "#ORD-" + cleanNumber.substring(0, Math.min(8, cleanNumber.length()));
        }
        return "Unknown";
    }
}

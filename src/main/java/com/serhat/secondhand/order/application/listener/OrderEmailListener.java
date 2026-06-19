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
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.thymeleaf.context.Context;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEmailListener {

    private final EmailService emailService;
    private final EmailConfig emailConfig;
    private final OrderMapper orderMapper;
    private final IUserService userService;
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
            String content = "Siparişiniz (" + getOrderDisplayName(order.getName(), order.getOrderNumber()) + ") iptal edilmiştir.";
            
            Context ctx1 = new Context();
            ctx1.setVariable("userName", event.requester().getName());
            ctx1.setVariable("message", content);
            ctx1.setVariable("headerTitle", "Sipariş İptali");
            emailService.sendTemplateEmail(event.requester(), emailConfig.getOrder().getCancelledSubject(), "generic-notification", ctx1, EmailType.NOTIFICATION);

            Order full = orderRepository.findByIdWithOrderItemsAndSellers(order.getId()).orElse(order);
            Set<Long> recipientIds = new LinkedHashSet<>();
            if (full.getUser() != null && full.getUser().getId() != null) {
                recipientIds.add(full.getUser().getId());
            }
            if (full.getOrderItems() != null) {
                for (OrderItem oi : full.getOrderItems()) {
                    if (oi.getSeller() != null && oi.getSeller().getId() != null) {
                        recipientIds.add(oi.getSeller().getId());
                    }
                }
            }
            recipientIds.remove(event.requester().getId());
            for (Long uid : recipientIds) {
                var userResult = userService.findById(uid);
                if (userResult.isError() || userResult.getData() == null) {
                    continue;
                }
                User counterparty = userResult.getData();
                Context ctx = new Context();
                ctx.setVariable("userName", counterparty.getName());
                ctx.setVariable("message", "Sipariş " + getOrderDisplayName(order.getName(), order.getOrderNumber()) + " karşı taraf tarafından iptal edildi.");
                ctx.setVariable("headerTitle", "Sipariş İptali");
                emailService.sendTemplateEmail(counterparty, emailConfig.getOrder().getCancelledSubject(), "generic-notification", ctx, EmailType.NOTIFICATION);
            }

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
            String completionWord = event.isAutomatic() ? "otomatik olarak tamamlandı" : "tamamlandı";
            String content = "Siparişiniz (" + getOrderDisplayName(order.getName(), order.getOrderNumber()) + ") " + completionWord + ".";
            
            Context ctx = new Context();
            ctx.setVariable("userName", event.buyer().getName());
            ctx.setVariable("message", content);
            ctx.setVariable("headerTitle", "Sipariş Tamamlandı");
            emailService.sendTemplateEmail(event.buyer(), emailConfig.getOrder().getCompletedSubject(), "generic-notification", ctx, EmailType.NOTIFICATION);
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
            String content = "Siparişiniz (" + getOrderDisplayName(order.getName(), order.getOrderNumber()) + ") iade edilmiştir. İade tutarı e-cüzdanınıza aktarıldı.";
            
            Context ctx = new Context();
            ctx.setVariable("userName", event.buyer().getName());
            ctx.setVariable("message", content);
            ctx.setVariable("headerTitle", "Sipariş İade");
            emailService.sendTemplateEmail(event.buyer(), emailConfig.getOrder().getRefundedSubject(), "generic-notification", ctx, EmailType.NOTIFICATION);
            orderLog.logNotificationSent("orderRefundedEmail", order.getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("orderRefundedEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void sendCustomerConfirmationEmail(User customer, OrderDto orderDto) {
        try {
            String subject = emailConfig.getOrderConfirmationSubject();
            Context ctx = new Context();
            ctx.setVariable("userName", customer.getName());
            ctx.setVariable("orderNumber", getOrderDisplayName(orderDto.getName(), orderDto.getOrderNumber()));
            ctx.setVariable("status", orderDto.getStatus());
            ctx.setVariable("paymentStatus", orderDto.getPaymentStatus());
            ctx.setVariable("totalAmount", orderDto.getTotalAmount() + " " + orderDto.getCurrency());
            ctx.setVariable("items", orderDto.getOrderItems());
            ctx.setVariable("deliveryMethod", orderDto.getDeliveryMethod() != null ? orderDto.getDeliveryMethod().name() : "");
            
            if (orderDto.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP) {
                ctx.setVariable("meetupLocation", orderDto.getMeetupLocation() != null ? orderDto.getMeetupLocation() : "Belirtilmemiş");
                ctx.setVariable("meetupVerificationCode", orderDto.getMeetupVerificationCode());
            } else if (orderDto.getShippingAddress() != null) {
                String address = orderDto.getShippingAddress().getAddressLine() + "<br>" +
                                 orderDto.getShippingAddress().getCity() + " " +
                                 orderDto.getShippingAddress().getState() + " " +
                                 orderDto.getShippingAddress().getPostalCode() + "<br>" +
                                 orderDto.getShippingAddress().getCountry();
                ctx.setVariable("shippingAddress", address);
            }

            emailService.sendTemplateEmail(customer, subject, "order-confirmation", ctx, EmailType.NOTIFICATION);
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
            
            Context ctx = new Context();
            ctx.setVariable("userName", seller.getName());
            ctx.setVariable("orderNumber", getOrderDisplayName(orderDto.getName(), orderDto.getOrderNumber()));
            BigDecimal total = sellerItems.stream()
                .map(OrderItemDto::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            ctx.setVariable("totalAmount", total + " " + orderDto.getCurrency());
            ctx.setVariable("items", sellerItems);
            ctx.setVariable("deliveryMethod", orderDto.getDeliveryMethod() != null ? orderDto.getDeliveryMethod().name() : "");
            
            if (orderDto.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP) {
                ctx.setVariable("meetupLocation", orderDto.getMeetupLocation() != null ? orderDto.getMeetupLocation() : "Belirtilmemiş");
            } else if (orderDto.getShippingAddress() != null) {
                String address = orderDto.getShippingAddress().getAddressLine() + "<br>" +
                                 orderDto.getShippingAddress().getCity() + " " +
                                 orderDto.getShippingAddress().getState() + " " +
                                 orderDto.getShippingAddress().getPostalCode() + "<br>" +
                                 orderDto.getShippingAddress().getCountry();
                ctx.setVariable("shippingAddress", address);
            }

            emailService.sendTemplateEmail(seller, subject, "sale-notification", ctx, EmailType.NOTIFICATION);
            orderLog.logNotificationSent("sellerSaleEmail", orderDto.getOrderNumber());
        } catch (Exception e) {
            orderLog.logNotificationFailed("sellerSaleEmail", orderDto.getOrderNumber(), e.getMessage());
        }
    }

    // StringBuilder methods removed in favor of Thymeleaf templates

    // StringBuilder methods removed in favor of Thymeleaf templates

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

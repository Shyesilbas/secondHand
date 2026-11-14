package com.serhat.secondhand.order.application.listener;

import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.*;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.application.event.model.OrderConfirmationEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.application.event.OrderCancelledEvent;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
public class OrderEmailListener {

    private final EmailEventPublisher emailEventPublisher;
    private final EmailConfig emailConfig;
    private final OrderMapper orderMapper;
    private final IUserService userService;
    private final OrderLogService orderLog;
    private final OrderRepository orderRepository;
    private final TransactionTemplate readOnlyTx;

    public OrderEmailListener(EmailEventPublisher emailEventPublisher,
                              EmailConfig emailConfig,
                              OrderMapper orderMapper,
                              IUserService userService,
                              OrderLogService orderLog,
                              OrderRepository orderRepository,
                              PlatformTransactionManager transactionManager) {
        this.emailEventPublisher = emailEventPublisher;
        this.emailConfig = emailConfig;
        this.orderMapper = orderMapper;
        this.userService = userService;
        this.orderLog = orderLog;
        this.orderRepository = orderRepository;
        this.readOnlyTx = new TransactionTemplate(transactionManager);
        this.readOnlyTx.setReadOnly(true);
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreated(OrderCreatedEvent event) {
        if (!event.paymentSuccessful()) {
            return;
        }
        try {
            OrderDto orderDto = readOnlyTx.execute(status -> orderRepository.findByIdWithFullDetails(event.order().getId())
                    .map(orderMapper::toDto)
                    .orElseGet(() -> orderMapper.toDto(event.order())));
            if (orderDto == null) {
                return;
            }
            sendCustomerConfirmationEmail(event.buyer(), orderDto);
            sendSellerNotificationEmails(orderDto);
            orderLog.logNotificationSent("orderCreatedEmail", event.order().getOrderNumber());
        } catch (RuntimeException e) {
            orderLog.logNotificationFailed("orderCreatedEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCancelled(OrderCancelledEvent event) {
        try {
            Order order = event.order();
            String displayName = getOrderDisplayName(order.getName(), order.getOrderNumber());
            // For a system cancellation the requester is the refunded buyer and the others
            // are the seller(s).
            String content = switch (event.cause()) {
                case SHIP_DEADLINE_MISSED -> "Siparişiniz (" + displayName + ") satıcı "
                        + OrderBusinessConstants.SHIP_DEADLINE_HOURS
                        + " saat içinde kargoya vermediği için iptal edildi ve ödemeniz iade edildi.";
                case SELLER_RESTRICTED -> "Siparişiniz (" + displayName
                        + ") satıcı hesabı kısıtlandığı için iptal edildi ve ödemeniz iade edildi.";
                case PARTICIPANT_REQUEST -> "Siparişiniz (" + displayName + ") iptal edilmiştir.";
            };
            String counterpartyMessage = switch (event.cause()) {
                case SHIP_DEADLINE_MISSED -> "Sipariş " + displayName + " "
                        + OrderBusinessConstants.SHIP_DEADLINE_HOURS
                        + " saat içinde kargoya verilmediği için otomatik olarak iptal edildi.";
                case SELLER_RESTRICTED -> "Sipariş " + displayName
                        + " hesabınız kısıtlandığı için otomatik olarak iptal edildi ve alıcıya iade yapıldı.";
                case PARTICIPANT_REQUEST -> "Sipariş " + displayName + " karşı taraf tarafından iptal edildi.";
            };

            var data1 = GenericEmailData.builder()
                    .userName(event.requester().getName())
                    .headerTitle("Sipariş İptali")
                    .message(content)
                    .build();
            emailEventPublisher.publish(new OrderCancelledEmailEvent(event.requester(),
                    emailConfig.getOrder().getCancelledSubject(), data1));

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
                var data = GenericEmailData.builder()
                        .userName(counterparty.getName())
                        .headerTitle("Sipariş İptali")
                        .message(counterpartyMessage)
                        .build();
                emailEventPublisher.publish(
                        new OrderCancelledEmailEvent(counterparty, emailConfig.getOrder().getCancelledSubject(), data));
            }

            orderLog.logNotificationSent("orderCancelledEmail", order.getOrderNumber());
        } catch (RuntimeException e) {
            orderLog.logNotificationFailed("orderCancelledEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCompleted(OrderCompletedEvent event) {
        try {
            Order order = event.order();
            String completionWord = event.isAutomatic() ? "otomatik olarak tamamlandı" : "tamamlandı";
            String content = "Siparişiniz (" + getOrderDisplayName(order.getName(), order.getOrderNumber()) + ") "
                    + completionWord + ".";

            var data = GenericEmailData.builder()
                    .userName(event.buyer().getName())
                    .headerTitle("Sipariş Tamamlandı")
                    .message(content)
                    .build();
            emailEventPublisher.publish(
                    new OrderCompletedEmailEvent(event.buyer(), emailConfig.getOrder().getCompletedSubject(), data));
            orderLog.logNotificationSent("orderCompletedEmail", order.getOrderNumber());
        } catch (RuntimeException e) {
            orderLog.logNotificationFailed("orderCompletedEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderRefunded(OrderRefundedEvent event) {
        try {
            Order order = event.order();
            String content = "Siparişiniz (" + getOrderDisplayName(order.getName(), order.getOrderNumber())
                    + ") iade edilmiştir. İade tutarı e-cüzdanınıza aktarıldı.";

            var data = GenericEmailData.builder()
                    .userName(event.buyer().getName())
                    .headerTitle("Sipariş İade")
                    .message(content)
                    .build();
            emailEventPublisher.publish(
                    new OrderRefundedEmailEvent(event.buyer(), emailConfig.getOrder().getRefundedSubject(), data));
            orderLog.logNotificationSent("orderRefundedEmail", order.getOrderNumber());
        } catch (RuntimeException e) {
            orderLog.logNotificationFailed("orderRefundedEmail", event.order().getOrderNumber(), e.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void sendCustomerConfirmationEmail(User customer, OrderDto orderDto) {
        try {
            String subject = emailConfig.getOrderConfirmationSubject();
            String shippingAddress = null;

            if (orderDto.getDeliveryMethod() != DeliveryMethod.SAFE_MEETUP && orderDto.getShippingAddress() != null) {
                shippingAddress = orderDto.getShippingAddress().getAddressLine() + "<br>" +
                        orderDto.getShippingAddress().getCity() + " " +
                        orderDto.getShippingAddress().getState() + " " +
                        orderDto.getShippingAddress().getPostalCode() + "<br>" +
                        orderDto.getShippingAddress().getCountry();
            }

            String formattedDate = orderDto.getCreatedAt() != null
                    ? java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").format(orderDto.getCreatedAt())
                    : "";
            String paymentMethodLabel = orderDto.getPaymentProviderName() != null
                    ? (orderDto.getPaymentProviderName().equals("EWALLET") ? "E-Cüzdan (E-Wallet)"
                            : orderDto.getPaymentProviderName())
                    : "E-Cüzdan (E-Wallet)";

            var data = OrderConfirmationEmailData.builder()
                    .userName(customer.getName())
                    .orderNumber(getOrderDisplayName(orderDto.getName(), orderDto.getOrderNumber()))
                    .status(orderDto.getStatus() != null ? orderDto.getStatus().name() : "")
                    .paymentStatus(orderDto.getPaymentStatus() != null ? orderDto.getPaymentStatus().name() : "")
                    .totalAmount(formatMoney(orderDto.getTotalAmount(),
                            orderDto.getCurrency() != null ? orderDto.getCurrency().name() : "TRY"))
                    .items(orderDto.getOrderItems())
                    .deliveryMethod(orderDto.getDeliveryMethod() != null ? orderDto.getDeliveryMethod().name() : "")
                    .meetupLocation(orderDto.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP
                            && orderDto.getMeetupLocation() != null ? orderDto.getMeetupLocation() : "Belirtilmemiş")
                    .meetupVerificationCode(orderDto.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP
                            ? orderDto.getMeetupVerificationCode()
                            : "")
                    .shippingAddress(shippingAddress)
                    .orderDate(formattedDate)
                    .paymentMethod(paymentMethodLabel)
                    .notes(orderDto.getNotes())
                    .build();

            emailEventPublisher.publish(new OrderConfirmationEmailEvent(customer, subject, data));
            orderLog.logNotificationSent("customerConfirmationEmail", orderDto.getOrderNumber());
        } catch (RuntimeException e) {
            orderLog.logNotificationFailed("customerConfirmationEmail", orderDto.getOrderNumber(), e.getMessage());
        }
    }

    private void sendSellerNotificationEmails(OrderDto orderDto) {
        if (orderDto.getOrderItems() == null || orderDto.getOrderItems().isEmpty()) {
            orderLog.logDataWarning("No order items found for seller email notifications in order: {}",
                    orderDto.getOrderNumber());
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
            String shippingAddress = null;

            if (orderDto.getDeliveryMethod() != DeliveryMethod.SAFE_MEETUP && orderDto.getShippingAddress() != null) {
                shippingAddress = orderDto.getShippingAddress().getAddressLine() + "<br>" +
                        orderDto.getShippingAddress().getCity() + " " +
                        orderDto.getShippingAddress().getState() + " " +
                        orderDto.getShippingAddress().getPostalCode() + "<br>" +
                        orderDto.getShippingAddress().getCountry();
            }

            BigDecimal total = sellerItems.stream()
                    .map(OrderItemDto::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String formattedDate = orderDto.getCreatedAt() != null
                    ? java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").format(orderDto.getCreatedAt())
                    : "";
            String paymentMethodLabel = orderDto.getPaymentProviderName() != null
                    ? (orderDto.getPaymentProviderName().equals("EWALLET") ? "E-Cüzdan (E-Wallet)"
                            : orderDto.getPaymentProviderName())
                    : "E-Cüzdan (E-Wallet)";

            var data = OrderConfirmationEmailData.builder()
                    .userName(seller.getName())
                    .orderNumber(getOrderDisplayName(orderDto.getName(), orderDto.getOrderNumber()))
                    .totalAmount(
                            formatMoney(total, orderDto.getCurrency() != null ? orderDto.getCurrency().name() : "TRY"))
                    .items(sellerItems)
                    .deliveryMethod(orderDto.getDeliveryMethod() != null ? orderDto.getDeliveryMethod().name() : "")
                    .meetupLocation(orderDto.getDeliveryMethod() == DeliveryMethod.SAFE_MEETUP
                            && orderDto.getMeetupLocation() != null ? orderDto.getMeetupLocation() : "Belirtilmemiş")
                    .shippingAddress(shippingAddress)
                    .orderDate(formattedDate)
                    .paymentMethod(paymentMethodLabel)
                    .notes(orderDto.getNotes())
                    .build();

            emailEventPublisher.publish(new SaleNotificationEmailEvent(seller, subject, data));
            orderLog.logNotificationSent("sellerSaleEmail", orderDto.getOrderNumber());
        } catch (RuntimeException e) {
            orderLog.logNotificationFailed("sellerSaleEmail", orderDto.getOrderNumber(), e.getMessage());
        }
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

    private String formatMoney(BigDecimal amount, String currency) {
        if (amount == null)
            return "0,00 " + (currency != null ? currency : "TRY");
        return String.format(java.util.Locale.forLanguageTag("tr-TR"), "%,.2f %s", amount,
                currency != null ? currency : "TRY");
    }
}

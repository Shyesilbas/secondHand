package com.serhat.secondhand.order.service;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationService {

    private final EmailService emailService;
    private final EmailConfig emailConfig;
    private final OrderMapper orderMapper;
    private final UserService userService;

    public void sendOrderNotifications(User user, com.serhat.secondhand.order.entity.Order order, boolean paymentSuccessful) {
        if (!paymentSuccessful) {
            log.info("Skipping notifications for failed order: {}", order.getOrderNumber());
            return;
        }

        try {
            OrderDto orderDto = orderMapper.toDto(order);
            sendCustomerNotification(user, orderDto);
            sendSellerNotifications(orderDto);
            
            log.info("Successfully sent notifications for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send notifications for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    private void sendCustomerNotification(User customer, OrderDto orderDto) {
        try {
            String subject = emailConfig.getOrderConfirmationSubject();
            String content = buildOrderConfirmationContent(customer, orderDto);
            
            emailService.sendEmail(customer, subject, content, EmailType.NOTIFICATION);
            log.info("Order confirmation email sent to customer: {}", customer.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email to customer {}: {}", customer.getEmail(), e.getMessage());
        }
    }

    private void sendSellerNotifications(OrderDto orderDto) {
        if (orderDto.getOrderItems() == null || orderDto.getOrderItems().isEmpty()) {
            log.warn("No order items found for seller notifications in order: {}", orderDto.getOrderNumber());
            return;
        }

        var itemsBySeller = groupOrderItemsBySeller(orderDto.getOrderItems());
        
        for (var entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<OrderItemDto> sellerItems = entry.getValue();
            
            sendSellerNotification(sellerId, orderDto, sellerItems);
        }
    }

    private java.util.Map<Long, List<OrderItemDto>> groupOrderItemsBySeller(List<OrderItemDto> orderItems) {
        return orderItems.stream()
                .filter(item -> item.getListing() != null && item.getListing().getSellerId() != null)
                .collect(Collectors.groupingBy(item -> item.getListing().getSellerId()));
    }

    private void sendSellerNotification(Long sellerId, OrderDto orderDto, List<OrderItemDto> sellerItems) {
        try {
            User seller = userService.findById(sellerId);
            String subject = emailConfig.getSaleNotificationSubject();
            String content = buildSaleNotificationContent(seller, orderDto, sellerItems);

            emailService.sendEmail(seller, subject, content, EmailType.NOTIFICATION);
            
            log.info("Sale notification sent to seller {} for order {}", 
                    seller.getEmail(), orderDto.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send sale notification to seller {} for order {}: {}", 
                    sellerId, orderDto.getOrderNumber(), e.getMessage());
        }
    }

    public void sendOrderCancellationNotification(User user, com.serhat.secondhand.order.entity.Order order) {
        try {
            String subject = "SecondHand - Order Cancelled";
            String content = "Hello " + user.getName() + ",\n\nYour order " + order.getOrderNumber() + " has been cancelled.\n";
            emailService.sendEmail(user, subject, content, EmailType.NOTIFICATION);
            log.info("Order cancellation notification sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send cancellation notification for order {}: {}", 
                    order.getOrderNumber(), e.getMessage());
        }
    }

    public void sendOrderStatusUpdateNotification(User user, com.serhat.secondhand.order.entity.Order order) {
        try {
            String subject = "SecondHand - Order Status Updated";
            String content = "Hello " + user.getName() + ",\n\nThe status of your order " + order.getOrderNumber() + " has been updated to: " + order.getStatus();
            emailService.sendEmail(user, subject, content, EmailType.NOTIFICATION);
            log.info("Order status update notification sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send status update notification for order {}: {}", 
                    order.getOrderNumber(), e.getMessage());
        }
    }

    private String buildOrderConfirmationContent(User user, OrderDto order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(user.getName()).append(",\n\n");
        sb.append("Thank you for your purchase! Your order has been confirmed.\n\n");
        sb.append("Order Number: ").append(order.getOrderNumber()).append('\n');
        sb.append("Status: ").append(order.getStatus()).append('\n');
        sb.append("Payment Status: ").append(order.getPaymentStatus()).append('\n');
        sb.append("Total: ").append(order.getTotalAmount()).append(' ').append(order.getCurrency()).append("\n");
        
        if (order.getShippingAddress() != null) {
            sb.append("\nShipping Address:\n");
            sb.append(order.getShippingAddress().getAddressLine()).append('\n');
            sb.append(order.getShippingAddress().getCity()).append(' ')
              .append(order.getShippingAddress().getState()).append(' ')
              .append(order.getShippingAddress().getPostalCode()).append('\n');
            sb.append(order.getShippingAddress().getCountry()).append('\n');
        }

        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            sb.append("\nItems:\n");
            order.getOrderItems().forEach(it -> {
                String title = it.getListing() != null ? it.getListing().getTitle() : "Item";
                sb.append("- ").append(title)
                  .append(" x").append(it.getQuantity())
                  .append(" — ").append(it.getTotalPrice()).append(' ').append(order.getCurrency())
                  .append('\n');
            });
        }

        if (order.getNotes() != null && !order.getNotes().isBlank()) {
            sb.append("\nNotes: ").append(order.getNotes()).append('\n');
        }
        if (order.getPaymentReference() != null) {
            sb.append("Payment Reference: ").append(order.getPaymentReference()).append('\n');
        }
        sb.append("\nBest regards,\nSecondHand Team\n");
        return sb.toString();
    }

    private String buildSaleNotificationContent(User seller, OrderDto order, List<OrderItemDto> sellerItems) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(seller.getName()).append(",\n\n");
        sb.append("Great news! Your item(s) have been sold!\n\n");
        sb.append("Order Number: ").append(order.getOrderNumber()).append('\n');
        sb.append("Buyer: ").append(order.getUserId()).append('\n'); // Assuming userId is available in OrderDto
        
        java.math.BigDecimal total = sellerItems.stream()
                .map(OrderItemDto::getTotalPrice)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                
        sb.append("Total Amount: ").append(total)
                .append(' ').append(order.getCurrency()).append("\n\n");
        
        sb.append("Sold Items:\n");
        sellerItems.forEach(item -> {
            String title = item.getListing() != null ? item.getListing().getTitle() : "Item";
            sb.append("- ").append(title)
              .append(" x").append(item.getQuantity())
              .append(" — ").append(item.getTotalPrice()).append(' ').append(order.getCurrency())
              .append('\n');
        });
        
        if (order.getShippingAddress() != null) {
            sb.append("\nShipping Address:\n");
            sb.append(order.getShippingAddress().getAddressLine()).append('\n');
            sb.append(order.getShippingAddress().getCity()).append(' ')
              .append(order.getShippingAddress().getState()).append(' ')
              .append(order.getShippingAddress().getPostalCode()).append('\n');
            sb.append(order.getShippingAddress().getCountry()).append('\n');
        }
        
        sb.append("\nPlease prepare the item(s) for shipping and contact the buyer if needed.\n");
        sb.append("Thank you for using SecondHand!\n\n");
        sb.append("Best regards,\nSecondHand Team\n");
        return sb.toString();
    }

    public void sendOrderRefundNotification(User user, com.serhat.secondhand.order.entity.Order order) {
        try {
            String subject = "SecondHand - Order Refunded";
            String content = "Hello " + user.getName() + ",\n\nYour order " + order.getOrderNumber() + " has been refunded. The refund amount has been credited to your eWallet.\n";
            emailService.sendEmail(user, subject, content, EmailType.NOTIFICATION);
            log.info("Order refund notification sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send refund notification for order {}: {}", 
                    order.getOrderNumber(), e.getMessage());
        }
    }

    public void sendOrderCompletionNotification(User user, com.serhat.secondhand.order.entity.Order order, boolean isAutomatic) {
        try {
            String subject = "SecondHand - Order Completed";
            String content = "Hello " + user.getName() + ",\n\nYour order " + order.getOrderNumber() + " has been " + 
                    (isAutomatic ? "automatically completed" : "completed") + ".\n";
            emailService.sendEmail(user, subject, content, EmailType.NOTIFICATION);
            log.info("Order completion notification sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send completion notification for order {}: {}", 
                    order.getOrderNumber(), e.getMessage());
        }
    }
}

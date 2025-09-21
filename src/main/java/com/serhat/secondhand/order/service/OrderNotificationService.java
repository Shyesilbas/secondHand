package com.serhat.secondhand.order.service;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service responsible for order-related notifications
 * Follows Single Responsibility Principle
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationService {

    private final EmailService emailService;
    private final OrderMapper orderMapper;
    private final UserService userService;

    /**
     * Sends notifications for completed order
     */
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
            // Don't throw exception - notifications should not fail the order process
        }
    }

    /**
     * Sends confirmation email to customer
     */
    private void sendCustomerNotification(User customer, OrderDto orderDto) {
        try {
            emailService.sendOrderConfirmationEmail(customer, orderDto);
            log.info("Order confirmation email sent to customer: {}", customer.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email to customer {}: {}", customer.getEmail(), e.getMessage());
        }
    }

    /**
     * Sends sale notification emails to sellers
     */
    private void sendSellerNotifications(OrderDto orderDto) {
        if (orderDto.getOrderItems() == null || orderDto.getOrderItems().isEmpty()) {
            log.warn("No order items found for seller notifications in order: {}", orderDto.getOrderNumber());
            return;
        }

        var itemsBySeller = groupOrderItemsBySeller(orderDto.getOrderItems());
        
        for (var entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<com.serhat.secondhand.order.dto.OrderItemDto> sellerItems = entry.getValue();
            
            sendSellerNotification(sellerId, orderDto, sellerItems);
        }
    }

    /**
     * Groups order items by seller ID
     */
    private java.util.Map<Long, List<com.serhat.secondhand.order.dto.OrderItemDto>> groupOrderItemsBySeller(
            List<com.serhat.secondhand.order.dto.OrderItemDto> orderItems) {
        
        return orderItems.stream()
                .filter(item -> item.getListing() != null && item.getListing().getSellerId() != null)
                .collect(Collectors.groupingBy(item -> item.getListing().getSellerId()));
    }

    /**
     * Sends notification to a specific seller
     */
    private void sendSellerNotification(Long sellerId, OrderDto orderDto, 
                                      List<com.serhat.secondhand.order.dto.OrderItemDto> sellerItems) {
        try {
            User seller = userService.findById(sellerId);
            emailService.sendSaleNotificationEmail(seller, orderDto, sellerItems);
            
            log.info("Sale notification sent to seller {} for order {}", 
                    seller.getEmail(), orderDto.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send sale notification to seller {} for order {}: {}", 
                    sellerId, orderDto.getOrderNumber(), e.getMessage());
        }
    }

    /**
     * Sends order cancellation notification
     */
    public void sendOrderCancellationNotification(User user, com.serhat.secondhand.order.entity.Order order) {
        try {
            // Add cancellation email method to EmailService if needed
            // OrderDto orderDto = orderMapper.toDto(order);
            // emailService.sendOrderCancellationEmail(user, orderDto);
            
            log.info("Order cancellation notification sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send cancellation notification for order {}: {}", 
                    order.getOrderNumber(), e.getMessage());
        }
    }

    /**
     * Sends order status update notification
     */
    public void sendOrderStatusUpdateNotification(User user, com.serhat.secondhand.order.entity.Order order) {
        try {
            // Add status update email method to EmailService if needed
            // OrderDto orderDto = orderMapper.toDto(order);
            // emailService.sendOrderStatusUpdateEmail(user, orderDto);
            
            log.info("Order status update notification sent for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.warn("Failed to send status update notification for order {}: {}", 
                    order.getOrderNumber(), e.getMessage());
        }
    }
}

package com.serhat.secondhand.user.application;

import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.notification.application.NotificationService;
import com.serhat.secondhand.order.application.OrderQueryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
@Slf4j
public class UserBadgeService {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ChatService chatService;
    private final OrderQueryService orderQueryService;
    private final Executor taskExecutor;

    public UserBadgeService(
            NotificationService notificationService,
            EmailService emailService,
            ChatService chatService,
            OrderQueryService orderQueryService,
            @Qualifier("taskExecutor") Executor taskExecutor) {
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.chatService = chatService;
        this.orderQueryService = orderQueryService;
        this.taskExecutor = taskExecutor;
    }

    @Cacheable(value = "userBadges", key = "#userId")
    public Map<String, Object> getUserBadges(Long userId) {
        log.info("[CACHE MISS] userBadges::{}", userId);

        // Run all count queries in parallel using the application's taskExecutor
        var notificationFuture = CompletableFuture.supplyAsync(() -> 
            notificationService.getUnreadCount(userId), taskExecutor);
            
        var emailFuture = CompletableFuture.supplyAsync(() -> 
            emailService.getUnreadCount(userId), taskExecutor);
            
        var chatFuture = CompletableFuture.supplyAsync(() -> 
            chatService.getTotalUnreadMessageCount(userId), taskExecutor);
            
        var ordersFuture = CompletableFuture.supplyAsync(() -> 
            orderQueryService.getPendingCompletionStatus(userId), taskExecutor);

        // Wait for all to complete
        CompletableFuture.allOf(notificationFuture, emailFuture, chatFuture, ordersFuture).join();

        try {
            Map<String, Object> pendingOrders = ordersFuture.get();
            return Map.of(
                "notificationCount", notificationFuture.get(),
                "emailUnreadCount", emailFuture.get(),
                "chatUnreadCount", chatFuture.get(),
                "hasPendingOrders", pendingOrders.getOrDefault("hasPendingOrders", false),
                "pendingOrderCount", pendingOrders.getOrDefault("pendingCount", 0L)
            );
        } catch (Exception e) {
            log.error("Error calculating aggregated badges for user {}", userId, e);
            throw new RuntimeException("Failed to calculate user badges", e);
        }
    }
}

package com.serhat.secondhand.user.api;

import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.notification.application.NotificationService;
import com.serhat.secondhand.order.application.OrderQueryService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Badges", description = "Aggregated badge counts for efficient frontend polling")
public class UserBadgesController {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ChatService chatService;
    private final OrderQueryService orderQueryService;

    @GetMapping("/badges")
    @Operation(
        summary = "Get all user badges",
        description = "Aggregated endpoint returning notification count, chat unread count, and pending order status in a single call"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Badges retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @Cacheable(value = "userBadges", key = "#currentUser.id")
    public ResponseEntity<Map<String, Object>> getUserBadges(@AuthenticationPrincipal User currentUser) {
        Long userId = currentUser.getId();
        log.debug("Fetching aggregated badges for user: {}", currentUser.getEmail());

        // Run all count queries in parallel
        var notificationFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> 
            notificationService.getUnreadCount(userId));
            
        var emailFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> 
            emailService.getUnreadCount(userId));
            
        var chatFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> 
            chatService.getTotalUnreadMessageCount(userId));
            
        var ordersFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> 
            orderQueryService.getPendingCompletionStatus(userId));

        // Wait for all to complete
        java.util.concurrent.CompletableFuture.allOf(notificationFuture, emailFuture, chatFuture, ordersFuture).join();

        try {
            Map<String, Object> pendingOrders = ordersFuture.get();
            Map<String, Object> badges = Map.of(
                "notificationCount", notificationFuture.get(),
                "emailUnreadCount", emailFuture.get(),
                "chatUnreadCount", chatFuture.get(),
                "hasPendingOrders", pendingOrders.get("hasPendingOrders"),
                "pendingOrderCount", pendingOrders.get("pendingCount")
            );
            return ResponseEntity.ok(badges);
        } catch (Exception e) {
            log.error("Error calculating aggregated badges", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

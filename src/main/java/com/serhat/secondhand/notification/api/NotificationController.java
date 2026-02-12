package com.serhat.secondhand.notification.api;

import com.serhat.secondhand.notification.dto.NotificationDto;
import com.serhat.secondhand.notification.service.INotificationService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "Notification management operations")
public class NotificationController {

    private final INotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get notifications", description = "Get paginated list of notifications for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to get notifications for user: {}, page: {}, size: {}", currentUser.getEmail(), page, size);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getUserNotifications(currentUser.getId(), pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Unread count retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        log.info("API request to get unread count for user: {}", currentUser.getEmail());
        Long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notification marked as read"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<?> markAsRead(@PathVariable UUID id,
                                          @AuthenticationPrincipal User currentUser) {
        log.info("API request to mark notification {} as read for user: {}", id, currentUser.getEmail());
        var result = notificationService.markAsRead(id, currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications as read for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All notifications marked as read"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        log.info("API request to mark all notifications as read for user: {}", currentUser.getEmail());
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok().build();
    }
}


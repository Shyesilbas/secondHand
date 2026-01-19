package com.serhat.secondhand.notification.dto;

import com.serhat.secondhand.notification.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private UUID id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private String actionUrl;
    private String metadata;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}


package com.serhat.secondhand.notification.dto;

import com.serhat.secondhand.notification.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private String actionUrl;
    private String metadata;
}


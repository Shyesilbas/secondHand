package com.serhat.secondhand.notification.dto;

import com.serhat.secondhand.notification.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private String actionUrl;
    private String metadata;

    /** IDE/Lombok uyumsuzluğunda builder iç sınıfına ihtiyaç bırakmaz. */
    public static NotificationRequest of(
            Long userId,
            NotificationType type,
            String title,
            String message,
            String actionUrl,
            String metadata) {
        return new NotificationRequest(userId, type, title, message, actionUrl, metadata);
    }
}


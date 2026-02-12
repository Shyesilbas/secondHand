package com.serhat.secondhand.notification.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.notification.dto.NotificationDto;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface INotificationService {
    
    Result<NotificationDto> createAndSend(NotificationRequest request);
    
    Result<NotificationDto> createBroadcast(NotificationRequest request);
    
    Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable);
    
    Long getUnreadCount(Long userId);
    
    Result<Void> markAsRead(UUID notificationId, Long userId);
    
    void markAllAsRead(Long userId);
    
    boolean existsByIdAndUserId(UUID notificationId, Long userId);
}

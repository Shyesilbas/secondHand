package com.serhat.secondhand.notification.service;

import com.serhat.secondhand.notification.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(Long userId, NotificationDto notification) {
        try {
            String destination = "/user/" + userId + "/notifications";
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Notification sent via WebSocket to user: {}, destination: {}", userId, destination);
        } catch (Exception e) {
            log.error("Failed to send notification via WebSocket to user: {}", userId, e);
        }
    }
}


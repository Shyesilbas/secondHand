package com.serhat.secondhand.chat.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.user.application.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatNotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    private final UserService userService;

    public void sendMessage(ChatMessageDto dto) {
        messagingTemplate.convertAndSend("/topic/chat/" + dto.getChatRoomId(), dto);
        
        try {
            String senderName = "Birisi";
            try {
                var sender = userService.findById(dto.getSenderId());
                if (sender != null) {
                    senderName = sender.getName() + " " + sender.getSurname();
                }
            } catch (Exception e) {
                log.warn("Failed to get sender name for notification: {}", e.getMessage());
            }
            
            String messagePreview = dto.getContent() != null && dto.getContent().length() > 50 
                    ? dto.getContent().substring(0, 50) + "..." 
                    : dto.getContent();
            
            String metadata = objectMapper.writeValueAsString(Map.of(
                    "chatRoomId", dto.getChatRoomId().toString(),
                    "senderId", dto.getSenderId().toString(),
                    "messageId", dto.getId() != null ? dto.getId().toString() : ""
            ));
            
            notificationService.createAndSend(NotificationRequest.builder()
                    .userId(dto.getRecipientId())
                    .type(NotificationType.CHAT_MESSAGE_RECEIVED)
                    .title("Yeni Mesaj")
                    .message(senderName + ": " + messagePreview)
                    .actionUrl("/chat/" + dto.getChatRoomId())
                    .metadata(metadata)
                    .build());
        } catch (JsonProcessingException e) {
            log.error("Failed to create in-app notification for chat message", e);
        }
    }
}

package com.serhat.secondhand.chat.notification;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatNotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;
    private final IUserService userService;

    public void sendMessage(ChatMessageDto dto) {
        messagingTemplate.convertAndSend("/topic/chat/" + dto.getChatRoomId(), dto);
        
        String senderName = "Someone";
        try {
            var senderResult = userService.findById(dto.getSenderId());
            if (senderResult.isSuccess() && senderResult.getData() != null) {
                User sender = senderResult.getData();
                senderName = sender.getName() + " " + sender.getSurname();
            }
        } catch (Exception e) {
            log.warn("Failed to get sender name for notification: {}", e.getMessage());
        }

        String messagePreview = dto.getContent() != null && dto.getContent().length() > 50
                ? dto.getContent().substring(0, 50) + "..."
                : dto.getContent();

        var notificationResult = notificationService.createAndSend(
                notificationTemplateCatalog.chatMessageReceived(
                        dto.getRecipientId(),
                        dto.getChatRoomId() != null ? dto.getChatRoomId().toString() : "",
                        dto.getSenderId() != null ? dto.getSenderId().toString() : "",
                        dto.getId() != null ? dto.getId().toString() : "",
                        senderName,
                        messagePreview
                )
        );
        if (notificationResult.isError()) {
            log.error("Failed to create notification: {}", notificationResult.getMessage());
        }
    }
}

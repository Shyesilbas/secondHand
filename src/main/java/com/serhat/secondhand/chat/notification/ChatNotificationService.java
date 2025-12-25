package com.serhat.secondhand.chat.notification;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendMessage(ChatMessageDto dto) {
        messagingTemplate.convertAndSend("/topic/chat/" + dto.getChatRoomId(), dto);
    }
}

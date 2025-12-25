package com.serhat.secondhand.chat.service;

import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ChatRoomUpdater {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public void updateLastMessage(Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId).orElse(null);
        if (room == null) {
            return;
        }

        Message lastMessage = messageRepository
                .findTopByChatRoomIdOrderByCreatedAtDesc(roomId)
                .orElse(null);

        if (lastMessage == null) {
            room.setLastMessage(null);
            room.setLastMessageTime(null);
            room.setLastMessageSenderId(null);
            return;
        }

        room.setLastMessage(lastMessage.getContent());
        room.setLastMessageTime(lastMessage.getCreatedAt());
        room.setLastMessageSenderId(lastMessage.getSender().getId());
    }
}

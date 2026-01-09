package com.serhat.secondhand.chat.mapper;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageMapper {

    public Message toEntity(ChatMessageDto dto, User sender, User recipient) {
        Message message = new Message();
        message.setChatRoomId(dto.getChatRoomId());
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(dto.getContent());
        message.setIsRead(false);
        message.setMessageType(Message.MessageType.TEXT);
        return message;
    }

    public ChatMessageDto toDto(Message message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(message.getId());
        dto.setChatRoomId(message.getChatRoomId());
        dto.setSenderId(message.getSender().getId());
        dto.setRecipientId(message.getRecipient().getId());
        dto.setContent(message.getContent());
        dto.setRead(message.getIsRead());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }


}

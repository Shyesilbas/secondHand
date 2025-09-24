package com.serhat.secondhand.chat.dto;

import com.serhat.secondhand.chat.entity.Message;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    
    private Long id;
    private String content;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private String recipientName;
    private Long chatRoomId;
    private Message.MessageType messageType;
    private Boolean isRead;
    private LocalDateTime createdAt;
    
    public static ChatMessageDto fromEntity(Message message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        
                System.out.println("Converting message to DTO - ID: " + message.getId() + ", Content: " + message.getContent());
        
        if (message.getSender() != null) {
            dto.setSenderId(message.getSender().getId());
            dto.setSenderName(message.getSender().getName() + " " + message.getSender().getSurname());
        } else {
            System.out.println("Sender is null for message ID: " + message.getId());
        }
        
        if (message.getRecipient() != null) {
            dto.setRecipientId(message.getRecipient().getId());
            dto.setRecipientName(message.getRecipient().getName() + " " + message.getRecipient().getSurname());
        } else {
            System.out.println("Recipient is null for message ID: " + message.getId());
        }
        
        dto.setChatRoomId(message.getChatRoomId());
        dto.setMessageType(message.getMessageType());
        dto.setIsRead(message.getIsRead());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}

package com.serhat.secondhand.chat.dto;

import com.serhat.secondhand.chat.entity.ChatRoom;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDto {

    private Long id;
    private String roomName;
    private ChatRoom.RoomType roomType;
    private String listingId;
    private List<Long> participantIds;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long lastMessageSenderId;
    private String lastMessageSenderName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer unreadCount;
    private String otherParticipantName;
    private Long otherParticipantId;
    private String listingTitle;

    public static ChatRoomDto fromEntity(ChatRoom chatRoom) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(chatRoom.getId());
        dto.setRoomName(chatRoom.getRoomName());
        dto.setRoomType(chatRoom.getRoomType());
        dto.setListingId(chatRoom.getListingId());
        dto.setParticipantIds(chatRoom.getParticipantIds());
        dto.setLastMessage(chatRoom.getLastMessage());
        dto.setLastMessageTime(chatRoom.getLastMessageTime());
        dto.setLastMessageSenderId(chatRoom.getLastMessageSenderId());
        dto.setCreatedAt(chatRoom.getCreatedAt());
        dto.setUpdatedAt(chatRoom.getUpdatedAt());
        return dto;
    }
}

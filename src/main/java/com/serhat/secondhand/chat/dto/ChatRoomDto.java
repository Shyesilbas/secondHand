package com.serhat.secondhand.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDto {

    private Long id;
    private String title;
    private String roomType;
    private String listingId;
    private String listingTitle;
    private Set<Long> participantIds;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long lastMessageSenderId;
    private String lastMessageSenderName;
    private Long otherParticipantId;
    private String otherParticipantName;
    private Long unreadCount;


}

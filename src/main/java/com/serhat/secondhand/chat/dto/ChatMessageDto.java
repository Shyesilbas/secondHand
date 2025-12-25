package com.serhat.secondhand.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {

    private Long id;
    private Long chatRoomId;
    private Long senderId;
    private Long recipientId;
    private String content;
    private Boolean read;
    private LocalDateTime createdAt;
}

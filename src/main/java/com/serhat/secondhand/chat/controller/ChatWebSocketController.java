package com.serhat.secondhand.chat.controller;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {
    
    private final ChatService chatService;
    
    /**
     * WebSocket üzerinden mesaj gönder
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
        log.info("Received WebSocket message - sender: {}, room: {}, content: {}", 
                chatMessageDto.getSenderId(), chatMessageDto.getChatRoomId(), chatMessageDto.getContent());
        
        chatService.sendMessage(chatMessageDto);
    }
    
    /**
     * Kullanıcıyı chat room'a ekle
     */
    @MessageMapping("/chat.joinRoom")
    public void joinRoom(@Payload ChatMessageDto chatMessageDto, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("chatRoomId", chatMessageDto.getChatRoomId());
        headerAccessor.getSessionAttributes().put("userId", chatMessageDto.getSenderId());
        
        log.info("User {} joined room: {}", chatMessageDto.getSenderId(), chatMessageDto.getChatRoomId());
    }
    
    /**
     * Kullanıcıyı chat room'dan çıkar
     */
    @MessageMapping("/chat.leaveRoom")
    public void leaveRoom(@Payload ChatMessageDto chatMessageDto, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().remove("chatRoomId");
        headerAccessor.getSessionAttributes().remove("userId");
        
        log.info("User {} left room: {}", chatMessageDto.getSenderId(), chatMessageDto.getChatRoomId());
    }
    
    /**
     * Mesajları okundu olarak işaretle
     */
    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload ChatMessageDto chatMessageDto) {
        log.info("Marking messages as read via WebSocket - user: {}, room: {}", 
                chatMessageDto.getSenderId(), chatMessageDto.getChatRoomId());
        
        chatService.markMessagesAsRead(chatMessageDto.getChatRoomId(), chatMessageDto.getSenderId());
    }
}

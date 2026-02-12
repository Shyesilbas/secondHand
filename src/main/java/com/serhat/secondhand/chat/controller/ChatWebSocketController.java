package com.serhat.secondhand.chat.controller;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.service.ChatService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {
    
    private final ChatService chatService;
    

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto, @AuthenticationPrincipal User user) {
        if (user == null) {
            log.warn("Unauthenticated WebSocket message attempt blocked");
            return;
        }
        
        if (!user.getId().equals(chatMessageDto.getSenderId())) {
            log.warn("WebSocket message sender mismatch - authenticated: {}, claimed: {}", 
                    user.getId(), chatMessageDto.getSenderId());
            return;
        }
        
        log.info("Received WebSocket message - sender: {}, room: {}", 
                user.getId(), chatMessageDto.getChatRoomId());
        
        chatService.sendMessage(chatMessageDto);
    }
    

    @MessageMapping("/chat.joinRoom")
    public void joinRoom(@Payload ChatMessageDto chatMessageDto, 
                        SimpMessageHeaderAccessor headerAccessor,
                        @AuthenticationPrincipal User user) {
        if (user == null) {
            log.warn("Unauthenticated WebSocket join attempt blocked");
            return;
        }
        
        if (!user.getId().equals(chatMessageDto.getSenderId())) {
            log.warn("WebSocket join room sender mismatch - authenticated: {}, claimed: {}", 
                    user.getId(), chatMessageDto.getSenderId());
            return;
        }
        
        headerAccessor.getSessionAttributes().put("chatRoomId", chatMessageDto.getChatRoomId());
        headerAccessor.getSessionAttributes().put("userId", user.getId());
        
        log.info("User {} joined room: {}", user.getId(), chatMessageDto.getChatRoomId());
    }
    

    @MessageMapping("/chat.leaveRoom")
    public void leaveRoom(@Payload ChatMessageDto chatMessageDto, 
                         SimpMessageHeaderAccessor headerAccessor,
                         @AuthenticationPrincipal User user) {
        if (user == null) {
            log.warn("Unauthenticated WebSocket leave attempt blocked");
            return;
        }
        
        headerAccessor.getSessionAttributes().remove("chatRoomId");
        headerAccessor.getSessionAttributes().remove("userId");
        
        log.info("User {} left room: {}", user.getId(), chatMessageDto.getChatRoomId());
    }
    

    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload ChatMessageDto chatMessageDto, @AuthenticationPrincipal User user) {
        if (user == null) {
            log.warn("Unauthenticated WebSocket markAsRead attempt blocked");
            return;
        }
        
        if (!user.getId().equals(chatMessageDto.getSenderId())) {
            log.warn("WebSocket markAsRead sender mismatch - authenticated: {}, claimed: {}", 
                    user.getId(), chatMessageDto.getSenderId());
            return;
        }
        
        log.info("Marking messages as read via WebSocket - user: {}, room: {}", 
                user.getId(), chatMessageDto.getChatRoomId());
        
        chatService.markMessagesAsRead(chatMessageDto.getChatRoomId(), user.getId());
    }
}

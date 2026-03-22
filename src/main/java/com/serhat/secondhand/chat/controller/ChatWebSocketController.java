package com.serhat.secondhand.chat.controller;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {
    
    private final ChatService chatService;

    /**
     * Resolves the authenticated User from the WebSocket principal.
     * @AuthenticationPrincipal does not work reliably in STOMP message handlers,
     * so we extract the principal manually from the accessor.
     */
    private User resolveUser(SimpMessageHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            Object p = auth.getPrincipal();
            if (p instanceof User user && user.getId() != null) {
                return user;
            }
        }
        return null;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto,
                            SimpMessageHeaderAccessor accessor) {
        User user = resolveUser(accessor);
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
                        SimpMessageHeaderAccessor accessor) {
        User user = resolveUser(accessor);
        if (user == null) {
            log.warn("Unauthenticated WebSocket join attempt blocked");
            return;
        }
        
        if (!user.getId().equals(chatMessageDto.getSenderId())) {
            log.warn("WebSocket join room sender mismatch - authenticated: {}, claimed: {}", 
                    user.getId(), chatMessageDto.getSenderId());
            return;
        }
        
        headerAccessorPut(accessor, chatMessageDto.getChatRoomId(), user.getId());
        log.info("User {} joined room: {}", user.getId(), chatMessageDto.getChatRoomId());
    }
    

    @MessageMapping("/chat.leaveRoom")
    public void leaveRoom(@Payload ChatMessageDto chatMessageDto, 
                         SimpMessageHeaderAccessor accessor) {
        User user = resolveUser(accessor);
        if (user == null) {
            log.warn("Unauthenticated WebSocket leave attempt blocked");
            return;
        }
        
        var attrs = accessor.getSessionAttributes();
        if (attrs != null) {
            attrs.remove("chatRoomId");
            attrs.remove("userId");
        }

        log.info("User {} left room: {}", user.getId(), chatMessageDto.getChatRoomId());
    }
    

    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload ChatMessageDto chatMessageDto,
                           SimpMessageHeaderAccessor accessor) {
        User user = resolveUser(accessor);
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

    private void headerAccessorPut(SimpMessageHeaderAccessor accessor, Long chatRoomId, Long userId) {
        var attrs = accessor.getSessionAttributes();
        if (attrs != null) {
            attrs.put("chatRoomId", chatRoomId);
            attrs.put("userId", userId);
        }
    }
}

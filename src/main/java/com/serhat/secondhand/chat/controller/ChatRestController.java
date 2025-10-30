package com.serhat.secondhand.chat.controller;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.chat.service.ChatService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatRestController {
    
    private final ChatService chatService;
    


    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@PathVariable Long userId) {
        log.info("Getting chat rooms for user: {}", userId);
        List<ChatRoomDto> chatRooms = chatService.getUserChatRooms(userId);
        log.info("Returning {} chat rooms for user {}", chatRooms.size(), userId);
        return ResponseEntity.ok(chatRooms);
    }

    @PostMapping("/rooms/direct")
    public ResponseEntity<ChatRoomDto> createOrGetDirectChat(
            @RequestParam Long userId1, 
            @RequestParam Long userId2) {
        log.info("Creating or getting direct chat between users: {} and {}", userId1, userId2);
        ChatRoomDto chatRoom = chatService.createOrGetDirectChat(userId1, userId2);
        return ResponseEntity.ok(chatRoom);
    }

    @PostMapping("/rooms/listing/{listingId}")
    public ResponseEntity<ChatRoomDto> createOrGetListingChat(
            @PathVariable String listingId, 
            @RequestParam Long userId,
            @RequestParam String listingTitle) {
        log.info("Creating or getting listing chat - listingId: {}, userId: {}, title: {}", listingId, userId, listingTitle);
        ChatRoomDto chatRoom = chatService.createOrGetListingChat(userId, listingId, listingTitle);
        return ResponseEntity.ok(chatRoom);
    }
    


    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody ChatMessageDto messageDto) {
        log.info("Sending message - sender: {}, room: {}, content: {}", 
                messageDto.getSenderId(), messageDto.getChatRoomId(), messageDto.getContent());
        ChatMessageDto sentMessage = chatService.sendMessage(messageDto);
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/rooms/{chatRoomId}/messages")
    public ResponseEntity<Page<ChatMessageDto>> getChatMessages(
            @PathVariable Long chatRoomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting messages for chat room: {} (page: {}, size: {})", chatRoomId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessageDto> messages = chatService.getChatMessages(chatRoomId, pageable);
        
        log.info("Returning {} messages for chat room {} (total: {})", 
                messages.getContent().size(), chatRoomId, messages.getTotalElements());
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/rooms/{chatRoomId}/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long chatRoomId, 
            @AuthenticationPrincipal User currentUser) {
        log.info("Marking messages as read - room: {}, user: {}", chatRoomId, currentUser.getEmail());
        chatService.markMessagesAsRead(chatRoomId, currentUser.getId());
        return ResponseEntity.ok().build();
    }


    @GetMapping("/messages/user/{userId}")
    public ResponseEntity<Page<ChatMessageDto>> getAllUserMessages(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting all messages for user: {} (page: {}, size: {})", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessageDto> messages = chatService.getAllUserMessages(userId, pageable);
        
        log.info("Returning {} messages for user {} (total: {})", 
                messages.getContent().size(), userId, messages.getTotalElements());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/messages/unread-count")
    public ResponseEntity<Long> getTotalUnreadMessageCount(@AuthenticationPrincipal User currentUser) {
        log.info("Getting total unread message count for user: {}", currentUser.getEmail());
        Long count = chatService.getTotalUnreadMessageCount(currentUser.getId());
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/rooms/{chatRoomId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long chatRoomId,
            @RequestParam Long userId) {
        log.info("Deleting conversation - roomId: {}, userId: {}", chatRoomId, userId);
        chatService.deleteConversation(chatRoomId, userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        log.info("Deleting message - messageId: {}, userId: {}", messageId, userId);
        chatService.deleteMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }
}

package com.serhat.secondhand.chat.api;

import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat Rest", description = "Chat Rest operations")
public class ChatRestController {
    
    private final ChatService chatService;
    


    @GetMapping("/rooms/user")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@AuthenticationPrincipal User currentUser) {
        log.debug("Getting chat rooms for user: {}", currentUser.getId());
        List<ChatRoomDto> chatRooms = chatService.getUserChatRooms(currentUser.getId());
        log.debug("Returning {} chat rooms for user {}", chatRooms.size(), currentUser.getId());
        return ResponseEntity.ok(chatRooms);
    }

    @PostMapping("/rooms/direct")
    public ResponseEntity<ChatRoomDto> createOrGetDirectChat(
            @RequestParam Long userId2,
            @AuthenticationPrincipal User currentUser) {
        log.info("Creating or getting direct chat between users: {} and {}", currentUser.getId(), userId2);
        ChatRoomDto chatRoom = chatService.createOrGetDirectChat(currentUser.getId(), userId2);
        return ResponseEntity.ok(chatRoom);
    }

    @PostMapping("/rooms/listing/{listing-id}")
    public ResponseEntity<ChatRoomDto> createOrGetListingChat(
            @PathVariable("listing-id") String listingId,
            @RequestParam String listingTitle,
            @AuthenticationPrincipal User currentUser) {
        log.info("Creating or getting listing chat - listingId: {}, userId: {}, title: {}", listingId, currentUser.getId(), listingTitle);
        ChatRoomDto chatRoom = chatService.createOrGetListingChat(currentUser.getId(), listingId, listingTitle);
        return ResponseEntity.ok(chatRoom);
    }
    


    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @Valid @RequestBody ChatMessageDto messageDto,
            @AuthenticationPrincipal User currentUser) {
        // Mesaj sahteciliğini engellemek için sender daima kimlik doğrulanmış kullanıcıdan alınır;
        // istekte gelen senderId değeri yok sayılır.
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        messageDto.setSenderId(currentUser.getId());
        log.info("Sending message - sender: {}, room: {}",
                currentUser.getId(), messageDto.getChatRoomId());
        ChatMessageDto sentMessage = chatService.sendMessage(messageDto);
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/rooms/{chat-room-id}/messages")
    public ResponseEntity<Page<ChatMessageDto>> getChatMessages(
            @PathVariable("chat-room-id") Long chatRoomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        log.debug("Getting messages for chat room: {} (page: {}, size: {}) for user: {}", chatRoomId, page, size, currentUser.getId());

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessageDto> messages = chatService.getChatMessages(chatRoomId, currentUser.getId(), pageable);
        
        log.debug("Returning {} messages for chat room {} (total: {})",
                messages.getContent().size(), chatRoomId, messages.getTotalElements());
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/rooms/{chat-room-id}/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable("chat-room-id") Long chatRoomId, 
            @AuthenticationPrincipal User currentUser) {
        log.info("Marking messages as read - room: {}, user: {}", chatRoomId, currentUser.getEmail());
        chatService.markMessagesAsRead(chatRoomId, currentUser.getId());
        return ResponseEntity.ok().build();
    }


    @GetMapping("/messages/user")
    public ResponseEntity<Page<ChatMessageDto>> getAllUserMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        log.debug("Getting all messages for user: {} (page: {}, size: {})", currentUser.getId(), page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessageDto> messages = chatService.getAllUserMessages(currentUser.getId(), pageable);
        
        log.debug("Returning {} messages for user {} (total: {})",
                messages.getContent().size(), currentUser.getId(), messages.getTotalElements());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/messages/unread-count")
    public ResponseEntity<Long> getTotalUnreadMessageCount(@AuthenticationPrincipal User currentUser) {
        log.debug("Getting total unread message count for user: {}", currentUser.getEmail());
        Long count = chatService.getTotalUnreadMessageCount(currentUser.getId());
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/rooms/{chat-room-id}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable("chat-room-id") Long chatRoomId,
            @AuthenticationPrincipal User currentUser) {
        log.info("Deleting conversation - roomId: {}, userId: {}", chatRoomId, currentUser.getId());
        chatService.deleteConversation(chatRoomId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/messages/{message-id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable("message-id") Long messageId,
            @AuthenticationPrincipal User currentUser) {
        log.info("Deleting message - messageId: {}, userId: {}", messageId, currentUser.getId());
        chatService.deleteMessage(messageId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}

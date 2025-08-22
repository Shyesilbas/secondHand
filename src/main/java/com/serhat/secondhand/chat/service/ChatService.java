package com.serhat.secondhand.chat.service;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ChatRoomDto> getUserChatRooms(Long userId) {
        log.info("Getting chat rooms for user: {}", userId);
        
        List<ChatRoom> chatRooms = chatRoomRepository.findByParticipantIdOrderByLastMessageTimeDesc(userId);
        log.info("Found {} chat rooms for user {}", chatRooms.size(), userId);
        
        return chatRooms.stream()
                .map(this::enrichChatRoomDto)
                .collect(Collectors.toList());
    }
    

    @Transactional
    public ChatRoomDto createOrGetDirectChat(Long userId1, Long userId2) {
        log.info("Creating or getting direct chat between users: {} and {}", userId1, userId2);
        
        Optional<ChatRoom> existingRoom = chatRoomRepository.findDirectChatRoom(userId1, userId2);
        if (existingRoom.isPresent()) {
            log.info("Found existing direct chat room: {}", existingRoom.get().getId());
            return enrichChatRoomDto(existingRoom.get());
        }
        
        ChatRoom newRoom = new ChatRoom();
        newRoom.setRoomName("Direct Chat");
        newRoom.setRoomType(ChatRoom.RoomType.DIRECT);
        newRoom.setParticipantIds(List.of(userId1, userId2));
        
        ChatRoom savedRoom = chatRoomRepository.save(newRoom);
        log.info("Created new direct chat room: {}", savedRoom.getId());
        
        return enrichChatRoomDto(savedRoom);
    }
    

    @Transactional
    public ChatRoomDto createOrGetListingChat(Long userId, String listingId, String listingTitle) {
        log.info("Creating or getting listing chat - userId: {}, listingId: {}, title: {}", userId, listingId, listingTitle);
        
        List<ChatRoom> existingRooms = chatRoomRepository.findByListingIdAndUserIdOrderByCreatedAtDesc(listingId, userId);
        if (!existingRooms.isEmpty()) {
            log.info("Found existing listing chat room: {}", existingRooms.get(0).getId());
            return enrichChatRoomDto(existingRooms.get(0));
        }
        
        // Listing'i bul ve seller'ı al
        Listing listing = listingRepository.findById(UUID.fromString(listingId))
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));
        
        Long sellerId = listing.getSeller().getId();
        log.info("Found listing seller: {}", sellerId);
        
        // Yeni listing chat oluştur (hem current user hem de seller)
        ChatRoom newRoom = new ChatRoom();
        newRoom.setRoomName("Chat about: " + listingTitle);
        newRoom.setRoomType(ChatRoom.RoomType.LISTING);
        newRoom.setListingId(listingId);
        newRoom.setParticipantIds(List.of(userId, sellerId));
        
        ChatRoom savedRoom = chatRoomRepository.save(newRoom);
        log.info("Created new listing chat room: {} with participants: {}", savedRoom.getId(), savedRoom.getParticipantIds());
        
        return enrichChatRoomDto(savedRoom);
    }
    
    // ==================== MESAJ İŞLEMLERİ ====================
    
    /**
     * Mesaj gönder
     */
    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto messageDto) {
        log.info("Sending message - sender: {}, recipient: {}, room: {}, content: {}", 
                messageDto.getSenderId(), messageDto.getRecipientId(), messageDto.getChatRoomId(), messageDto.getContent());
        
        // Sender ve recipient user'ları bul
        User sender = userRepository.findById(messageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender user not found"));
        User recipient = userRepository.findById(messageDto.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient user not found"));
        
        // Mesajı kaydet
        Message message = new Message();
        message.setContent(messageDto.getContent());
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setChatRoomId(messageDto.getChatRoomId());
        message.setMessageType(messageDto.getMessageType() != null ? messageDto.getMessageType() : Message.MessageType.TEXT);
        message.setIsRead(false);
        
        Message savedMessage = messageRepository.save(message);
        ChatMessageDto savedMessageDto = ChatMessageDto.fromEntity(savedMessage);
        
        // Chat room'un son mesaj bilgilerini güncelle
        updateChatRoomLastMessage(messageDto.getChatRoomId(), savedMessageDto);
        
        // WebSocket ile mesajı gönder
        sendMessageViaWebSocket(savedMessageDto);
        
        log.info("Message sent successfully - ID: {}", savedMessage.getId());
        return savedMessageDto;
    }
    
    /**
     * Chat room'daki mesajları getir
     */
    public Page<ChatMessageDto> getChatMessages(Long chatRoomId, Pageable pageable) {
        log.info("Getting messages for chat room: {}", chatRoomId);
        
        Page<Message> messages = messageRepository.findByChatRoomIdOrderByCreatedAtDesc(chatRoomId, pageable);
        log.info("Found {} messages for chat room {}", messages.getTotalElements(), chatRoomId);
        
        // Debug için mesajları logla
        messages.getContent().forEach(message -> {
            log.info("Message - ID: {}, Content: {}, Sender: {}, Recipient: {}", 
                    message.getId(), message.getContent(), 
                    message.getSender() != null ? message.getSender().getId() : "NULL",
                    message.getRecipient() != null ? message.getRecipient().getId() : "NULL");
        });
        
        return messages.map(ChatMessageDto::fromEntity);
    }
    
    /**
     * Mesajları okundu olarak işaretle
     */
    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        log.info("Marking messages as read - room: {}, user: {}", chatRoomId, userId);
        
        messageRepository.markMessagesAsRead(chatRoomId, userId);
        log.info("Messages marked as read successfully");
    }
    
    /**
     * Chat room'daki okunmamış mesaj sayısını getir
     */
    public Long getUnreadMessageCount(Long chatRoomId, Long userId) {
        return chatRoomRepository.countUnreadMessagesByChatRoomAndUser(chatRoomId, userId);
    }
    
    /**
     * Kullanıcının tüm mesajlarını getir (gönderdiği veya aldığı)
     */
    public Page<ChatMessageDto> getAllUserMessages(Long userId, Pageable pageable) {
        log.info("Getting all messages for user: {}", userId);
        
        Page<Message> messages = messageRepository.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(userId, pageable);
        log.info("Found {} messages for user {}", messages.getTotalElements(), userId);
        
        return messages.map(ChatMessageDto::fromEntity);
    }
    
    /**
     * Kullanıcının toplam okunmamış mesaj sayısını getir
     */
    public Long getTotalUnreadMessageCount(Long userId) {
        log.info("Getting total unread message count for user: {}", userId);
        return messageRepository.countTotalUnreadMessagesByUser(userId);
    }
    
    // ==================== YARDIMCI METODLAR ====================
    
    /**
     * ChatRoomDto'yu zenginleştir (unread count, other participant name vb.)
     */
    private ChatRoomDto enrichChatRoomDto(ChatRoom chatRoom) {
        ChatRoomDto dto = ChatRoomDto.fromEntity(chatRoom);
        
        // Okunmamış mesaj sayısını hesapla (ilk participant için)
        if (!chatRoom.getParticipantIds().isEmpty()) {
            Long firstParticipant = chatRoom.getParticipantIds().get(0);
            dto.setUnreadCount(chatRoomRepository.countUnreadMessagesByChatRoomAndUser(chatRoom.getId(), firstParticipant).intValue());
        }
        
        return dto;
    }
    
    /**
     * Chat room'un son mesaj bilgilerini güncelle
     */
    @Transactional
    public void updateChatRoomLastMessage(Long chatRoomId, ChatMessageDto messageDto) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElse(null);
        if (chatRoom != null) {
            chatRoom.setLastMessage(messageDto.getContent());
            chatRoom.setLastMessageTime(messageDto.getCreatedAt());
            chatRoom.setLastMessageSenderId(messageDto.getSenderId());
            chatRoomRepository.save(chatRoom);
        }
    }
    
    /**
     * WebSocket ile mesaj gönder
     */
    private void sendMessageViaWebSocket(ChatMessageDto messageDto) {
        String destination = "/topic/chat/" + messageDto.getChatRoomId();
        messagingTemplate.convertAndSend(destination, messageDto);
        
        log.info("Message sent via WebSocket to destination: {}", destination);
        log.info("Message details - ID: {}, Content: {}, Sender: {}, Room: {}", 
                messageDto.getId(), messageDto.getContent(), messageDto.getSenderId(), messageDto.getChatRoomId());
    }
    
    /**
     * Geçici: Mevcut listing chat room'larını düzelt
     */
    @Transactional
    public void fixListingChatRooms() {
        log.info("Fixing listing chat rooms...");
        
        // Tüm listing chat room'larını bul
        List<ChatRoom> listingRooms = chatRoomRepository.findAll().stream()
                .filter(room -> room.getRoomType() == ChatRoom.RoomType.LISTING)
                .collect(Collectors.toList());
        
        log.info("Found {} listing chat rooms to fix", listingRooms.size());
        
        for (ChatRoom room : listingRooms) {
            try {
                // Listing'i bul
                Listing listing = listingRepository.findById(UUID.fromString(room.getListingId()))
                        .orElse(null);
                
                if (listing != null) {
                    Long sellerId = listing.getSeller().getId();
                    
                    // Seller'ı participant listesine ekle (eğer yoksa)
                    if (!room.getParticipantIds().contains(sellerId)) {
                        List<Long> newParticipants = new ArrayList<>(room.getParticipantIds());
                        newParticipants.add(sellerId);
                        room.setParticipantIds(newParticipants);
                        chatRoomRepository.save(room);
                        log.info("Added seller {} to chat room {}", sellerId, room.getId());
                    }
                }
            } catch (Exception e) {
                log.error("Error fixing chat room {}: {}", room.getId(), e.getMessage());
            }
        }
        
        log.info("Finished fixing listing chat rooms");
    }
}

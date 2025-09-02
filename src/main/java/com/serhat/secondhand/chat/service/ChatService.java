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
                .map(room -> enrichChatRoomDtoForUser(room, userId))
                .collect(Collectors.toList());
    }
    

    @Transactional
    public ChatRoomDto createOrGetDirectChat(Long userId1, Long userId2) {
        log.info("Creating or getting direct chat between users: {} and {}", userId1, userId2);
        
        Optional<ChatRoom> existingRoom = chatRoomRepository.findDirectChatRoom(userId1, userId2);
        if (existingRoom.isPresent()) {
            log.info("Found existing direct chat room: {}", existingRoom.get().getId());
            return enrichChatRoomDtoForUser(existingRoom.get(), userId1);
        }
        
        ChatRoom newRoom = new ChatRoom();
        newRoom.setRoomName("Direct Chat");
        newRoom.setRoomType(ChatRoom.RoomType.DIRECT);
        newRoom.setParticipantIds(List.of(userId1, userId2));
        
        ChatRoom savedRoom = chatRoomRepository.save(newRoom);
        log.info("Created new direct chat room: {}", savedRoom.getId());
        
        return enrichChatRoomDtoForUser(savedRoom, userId1);
    }
    

    @Transactional
    public ChatRoomDto createOrGetListingChat(Long userId, String listingId, String listingTitle) {
        log.info("Creating or getting listing chat - userId: {}, listingId: {}, title: {}", userId, listingId, listingTitle);
        
        List<ChatRoom> existingRooms = chatRoomRepository.findByListingIdAndUserIdOrderByCreatedAtDesc(listingId, userId);
        if (!existingRooms.isEmpty()) {
            log.info("Found existing listing chat room: {}", existingRooms.get(0).getId());
            return enrichChatRoomDtoForUser(existingRooms.get(0), userId);
        }
        
        Listing listing = listingRepository.findById(UUID.fromString(listingId))
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));
        
        Long sellerId = listing.getSeller().getId();
        log.info("Found listing seller: {}", sellerId);
        
        ChatRoom newRoom = new ChatRoom();
        newRoom.setRoomName("Chat about: " + listingTitle);
        newRoom.setRoomType(ChatRoom.RoomType.LISTING);
        newRoom.setListingId(listingId);
        newRoom.setParticipantIds(List.of(userId, sellerId));
        
        ChatRoom savedRoom = chatRoomRepository.save(newRoom);
        log.info("Created new listing chat room: {} with participants: {}", savedRoom.getId(), savedRoom.getParticipantIds());
        
        return enrichChatRoomDtoForUser(savedRoom, userId);
    }
    

    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto messageDto) {
        log.info("Sending message - sender: {}, recipient: {}, room: {}, content: {}", 
                messageDto.getSenderId(), messageDto.getRecipientId(), messageDto.getChatRoomId(), messageDto.getContent());
        
        User sender = userRepository.findById(messageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender user not found"));
        User recipient = userRepository.findById(messageDto.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient user not found"));
        
        Message message = new Message();
        message.setContent(messageDto.getContent());
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setChatRoomId(messageDto.getChatRoomId());
        message.setMessageType(messageDto.getMessageType() != null ? messageDto.getMessageType() : Message.MessageType.TEXT);
        message.setIsRead(false);
        
        Message savedMessage = messageRepository.save(message);
        ChatMessageDto savedMessageDto = ChatMessageDto.fromEntity(savedMessage);
        
        updateChatRoomLastMessage(messageDto.getChatRoomId(), savedMessageDto);
        
        sendMessageViaWebSocket(savedMessageDto);
        
        log.info("Message sent successfully - ID: {}", savedMessage.getId());
        return savedMessageDto;
    }

    public Page<ChatMessageDto> getChatMessages(Long chatRoomId, Pageable pageable) {
        log.info("Getting messages for chat room: {}", chatRoomId);
        
        Page<Message> messages = messageRepository.findByChatRoomIdOrderByCreatedAtDesc(chatRoomId, pageable);
        log.info("Found {} messages for chat room {}", messages.getTotalElements(), chatRoomId);
        
        messages.getContent().forEach(message -> {
            log.info("Message - ID: {}, Content: {}, Sender: {}, Recipient: {}", 
                    message.getId(), message.getContent(), 
                    message.getSender() != null ? message.getSender().getId() : "NULL",
                    message.getRecipient() != null ? message.getRecipient().getId() : "NULL");
        });
        
        return messages.map(ChatMessageDto::fromEntity);
    }
    

    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        log.info("Marking messages as read - room: {}, user: {}", chatRoomId, userId);
        
        messageRepository.markMessagesAsRead(chatRoomId, userId);
        log.info("Messages marked as read successfully");
    }
    

    public Long getUnreadMessageCount(Long chatRoomId, Long userId) {
        return chatRoomRepository.countUnreadMessagesByChatRoomAndUser(chatRoomId, userId);
    }
    

    public Page<ChatMessageDto> getAllUserMessages(Long userId, Pageable pageable) {
        log.info("Getting all messages for user: {}", userId);
        
        Page<Message> messages = messageRepository.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(userId, pageable);
        log.info("Found {} messages for user {}", messages.getTotalElements(), userId);
        
        return messages.map(ChatMessageDto::fromEntity);
    }

    public Long getTotalUnreadMessageCount(Long userId) {
        log.info("Getting total unread message count for user: {}", userId);
        return messageRepository.countTotalUnreadMessagesByUser(userId);
    }


    private ChatRoomDto enrichChatRoomDtoForUser(ChatRoom chatRoom, Long currentUserId) {
        ChatRoomDto dto = ChatRoomDto.fromEntity(chatRoom);

        dto.setUnreadCount(chatRoomRepository.countUnreadMessagesByChatRoomAndUser(chatRoom.getId(), currentUserId).intValue());

        enrichOtherParticipantInfo(dto, chatRoom, currentUserId);

        if (chatRoom.getLastMessageSenderId() != null) {
            User lastMessageSender = userRepository.findById(chatRoom.getLastMessageSenderId()).orElse(null);
            if (lastMessageSender != null) {
                dto.setLastMessageSenderName(lastMessageSender.getName() + " " + lastMessageSender.getSurname());
            }
        }

        return dto;
    }


    private void enrichOtherParticipantInfo(ChatRoomDto dto, ChatRoom chatRoom, Long currentUserId) {
        if (chatRoom.getRoomType() == ChatRoom.RoomType.DIRECT) {
            if (chatRoom.getParticipantIds().size() >= 2) {
                Long otherParticipantId = chatRoom.getParticipantIds().stream()
                        .filter(id -> !id.equals(currentUserId))
                        .findFirst()
                        .orElse(null);

                if (otherParticipantId != null) {
                    User otherUser = userRepository.findById(otherParticipantId).orElse(null);
                    if (otherUser != null) {
                        dto.setOtherParticipantId(otherUser.getId());
                        dto.setOtherParticipantName(otherUser.getName() + " " + otherUser.getSurname());
                    }
                }
            }
        } else if (chatRoom.getRoomType() == ChatRoom.RoomType.LISTING) {
            if (chatRoom.getListingId() != null) {
                Listing listing = listingRepository.findById(UUID.fromString(chatRoom.getListingId())).orElse(null);
                if (listing != null) {
                    dto.setListingTitle(listing.getTitle());

                    Long sellerId = listing.getSeller().getId();
                    if (currentUserId.equals(sellerId)) {
                        // Login user seller → otherParticipant = buyer
                        Long buyerId = chatRoom.getParticipantIds().stream()
                                .filter(id -> !id.equals(sellerId))
                                .findFirst()
                                .orElse(null);
                        if (buyerId != null) {
                            User buyer = userRepository.findById(buyerId).orElse(null);
                            if (buyer != null) {
                                dto.setOtherParticipantId(buyer.getId());
                                dto.setOtherParticipantName(buyer.getName() + " " + buyer.getSurname());
                            }
                        }
                    } else {
                        // Login user buyer → otherParticipant = seller
                        User seller = listing.getSeller();
                        dto.setOtherParticipantId(seller.getId());
                        dto.setOtherParticipantName(seller.getName() + " " + seller.getSurname());
                    }
                }
            }
        }
    }


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
    

    private void sendMessageViaWebSocket(ChatMessageDto messageDto) {
        String destination = "/topic/chat/" + messageDto.getChatRoomId();
        messagingTemplate.convertAndSend(destination, messageDto);
        
        log.info("Message sent via WebSocket to destination: {}", destination);
        log.info("Message details - ID: {}, Content: {}, Sender: {}, Room: {}", 
                messageDto.getId(), messageDto.getContent(), messageDto.getSenderId(), messageDto.getChatRoomId());
    }

    @Transactional
    public void fixListingChatRooms() {
        log.info("Fixing listing chat rooms...");
        
        List<ChatRoom> listingRooms = chatRoomRepository.findAll().stream()
                .filter(room -> room.getRoomType() == ChatRoom.RoomType.LISTING)
                .toList();
        
        log.info("Found {} listing chat rooms to fix", listingRooms.size());
        
        for (ChatRoom room : listingRooms) {
            try {
                Listing listing = listingRepository.findById(UUID.fromString(room.getListingId()))
                        .orElse(null);
                
                if (listing != null) {
                    Long sellerId = listing.getSeller().getId();
                    
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

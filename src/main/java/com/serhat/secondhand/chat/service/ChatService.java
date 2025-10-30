package com.serhat.secondhand.chat.service;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.chat.util.ChatErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final ListingRepository listingRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ChatRoomDto> getUserChatRooms(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findByParticipantIdOrderByLastMessageTimeDesc(userId);
        return rooms.stream()
                .map(room -> enrichChatRoomDtoForUser(room, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatRoomDto createOrGetDirectChat(Long user1, Long user2) {
        validateUsersExist(user1, user2);
        return chatRoomRepository.findDirectChatRoom(user1, user2)
                .map(room -> enrichChatRoomDtoForUser(room, user1))
                .orElseGet(() -> createChatRoom("Direct Chat", ChatRoom.RoomType.DIRECT, List.of(user1, user2), null, user1));
    }


    @Transactional
    public ChatRoomDto createOrGetListingChat(Long userId, String listingId, String listingTitle) {
        List<ChatRoom> existing = chatRoomRepository.findByListingIdAndUserIdOrderByCreatedAtDesc(listingId, userId);
        if (!existing.isEmpty()) return enrichChatRoomDtoForUser(existing.get(0), userId);

        Listing listing = listingRepository.findById(UUID.fromString(listingId))
                .orElseThrow(() -> new BusinessException(ChatErrorCodes.LISTING_NOT_FOUND));
        Long sellerId = listing.getSeller().getId();
        return createChatRoom("Chat about: " + listingTitle, ChatRoom.RoomType.LISTING, List.of(userId, sellerId), listingId, userId);
    }

    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto dto) {
        validateMessage(dto);
        validateChatRoomAccess(dto.getChatRoomId(), dto.getSenderId());

        Message msg = buildMessage(dto);
        Message saved = messageRepository.save(msg);
        ChatMessageDto savedDto = ChatMessageDto.fromEntity(saved);

        refreshChatRoomLastMessage(dto.getChatRoomId());
        sendViaWebSocket(savedDto);
        return savedDto;
    }

    public Page<ChatMessageDto> getChatMessages(Long chatRoomId, Pageable pageable) {
        return messageRepository.findByChatRoomIdOrderByCreatedAtAsc(chatRoomId, pageable)
                .map(ChatMessageDto::fromEntity);
    }

    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        messageRepository.markMessagesAsRead(chatRoomId, userId);
    }

    public Long getUnreadMessageCount(Long chatRoomId, Long userId) {
        return chatRoomRepository.countUnreadMessagesByChatRoomAndUser(chatRoomId, userId);
    }

    public Long getTotalUnreadMessageCount(Long userId) {
        return messageRepository.countTotalUnreadMessagesByUser(userId);
    }

    @Transactional
    public void deleteConversation(Long chatRoomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new BusinessException(ChatErrorCodes.CHAT_ROOM_NOT_FOUND));
        if (!room.getParticipantIds().contains(userId))
            throw new BusinessException(ChatErrorCodes.ACCESS_DENIED);

        messageRepository.deleteByChatRoomId(chatRoomId);
        chatRoomRepository.delete(room);
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new BusinessException(ChatErrorCodes.MESSAGE_NOT_FOUND));

        if (!msg.getSender().getId().equals(userId))
            throw new BusinessException(ChatErrorCodes.ACCESS_DENIED);

        messageRepository.delete(msg);
        refreshChatRoomLastMessage(msg.getChatRoomId());
    }

    private ChatRoomDto createChatRoom(String name, ChatRoom.RoomType type, List<Long> participants, String listingId, Long currentUserId) {
        ChatRoom room = new ChatRoom();
        room.setRoomName(name);
        room.setRoomType(type);
        room.setParticipantIds(participants);
        room.setListingId(listingId);
        return enrichChatRoomDtoForUser(chatRoomRepository.save(room), currentUserId);
    }

    private void validateUsersExist(Long... ids) {
        for (Long id : ids) userService.findById(id);
    }

    private void validateMessage(ChatMessageDto dto) {
        if (dto.getContent() == null || dto.getContent().trim().isEmpty())
            throw new BusinessException(ChatErrorCodes.INVALID_MESSAGE_CONTENT);
        if (dto.getContent().length() > 1000)
            throw new BusinessException(ChatErrorCodes.MESSAGE_TOO_LONG);
    }

    private void validateChatRoomAccess(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new BusinessException(ChatErrorCodes.CHAT_ROOM_NOT_FOUND));
        if (!room.getParticipantIds().contains(userId))
            throw new BusinessException(ChatErrorCodes.ACCESS_DENIED);
    }

    private Message buildMessage(ChatMessageDto dto) {
        User sender = userService.findById(dto.getSenderId());
        User recipient = userService.findById(dto.getRecipientId());
        Message m = new Message();
        m.setContent(dto.getContent().trim());
        m.setSender(sender);
        m.setRecipient(recipient);
        m.setChatRoomId(dto.getChatRoomId());
        m.setMessageType(dto.getMessageType() != null ? dto.getMessageType() : Message.MessageType.TEXT);
        m.setIsRead(false);
        return m;
    }

    @Transactional
    public void refreshChatRoomLastMessage(Long roomId) {
        Optional<Message> lastMsg = messageRepository.findTopByChatRoomIdOrderByCreatedAtDesc(roomId);
        chatRoomRepository.findById(roomId).ifPresent(room -> {
            if (lastMsg.isPresent()) {
                Message m = lastMsg.get();
                room.setLastMessage(m.getContent());
                room.setLastMessageTime(m.getCreatedAt());
                room.setLastMessageSenderId(m.getSender().getId());
            } else {
                room.setLastMessage(null);
                room.setLastMessageTime(null);
                room.setLastMessageSenderId(null);
            }
            chatRoomRepository.save(room);
        });
    }

    private void sendViaWebSocket(ChatMessageDto dto) {
        messagingTemplate.convertAndSend("/topic/chat/" + dto.getChatRoomId(), dto);
    }

    private ChatRoomDto enrichChatRoomDtoForUser(ChatRoom room, Long currentUserId) {
        ChatRoomDto dto = ChatRoomDto.fromEntity(room);
        dto.setUnreadCount(chatRoomRepository.countUnreadMessagesByChatRoomAndUser(room.getId(), currentUserId).intValue());
        enrichOtherParticipant(dto, room, currentUserId);
        if (room.getLastMessageSenderId() != null) {
            User sender = userService.findById(room.getLastMessageSenderId());
            dto.setLastMessageSenderName(sender.getName() + " " + sender.getSurname());
        }
        return dto;
    }

    private void enrichOtherParticipant(ChatRoomDto dto, ChatRoom room, Long currentUserId) {
        if (room.getRoomType() == ChatRoom.RoomType.DIRECT) {
            room.getParticipantIds().stream()
                    .filter(id -> !id.equals(currentUserId))
                    .findFirst()
                    .ifPresent(id -> {
                        User other = userService.findById(id);
                        dto.setOtherParticipantId(other.getId());
                        dto.setOtherParticipantName(other.getName() + " " + other.getSurname());
                    });
        } else if (room.getRoomType() == ChatRoom.RoomType.LISTING && room.getListingId() != null) {
            listingRepository.findById(UUID.fromString(room.getListingId())).ifPresent(listing -> {
                dto.setListingTitle(listing.getTitle());
                Long sellerId = listing.getSeller().getId();
                Long otherId = currentUserId.equals(sellerId)
                        ? room.getParticipantIds().stream().filter(id -> !id.equals(sellerId)).findFirst().orElse(null)
                        : sellerId;
                if (otherId != null) {
                    User other = userService.findById(otherId);
                    dto.setOtherParticipantId(other.getId());
                    dto.setOtherParticipantName(other.getName() + " " + other.getSurname());
                }
            });
        }
    }

    public Page<ChatMessageDto> getAllUserMessages(Long userId, Pageable pageable) {
        log.info("Getting all messages for user: {}", userId);

        Page<Message> messages = messageRepository.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(userId, pageable);
        log.info("Found {} messages for user {}", messages.getTotalElements(), userId);

        return messages.map(ChatMessageDto::fromEntity);
    }
}

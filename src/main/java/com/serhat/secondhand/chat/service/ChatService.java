package com.serhat.secondhand.chat.service;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.chat.enricher.ChatEnrichmentContext;
import com.serhat.secondhand.chat.enricher.ChatRoomEnricher;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.mapper.ChatMessageMapper;
import com.serhat.secondhand.chat.mapper.ChatRoomMapper;
import com.serhat.secondhand.chat.notification.ChatNotificationService;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final ListingRepository listingRepository;
    private final UserService userService;
    private final ChatRoomMapper chatRoomMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final ChatRoomEnricher chatRoomEnricher;
    private final ChatNotificationService notificationService;
    private final ChatRoomUpdater chatRoomUpdater;
    private final ChatAuthorizationService chatAuthorizationService;

    @Transactional(readOnly = true)
    public List<ChatRoomDto> getUserChatRooms(Long userId) {

        List<ChatRoom> rooms =
                chatRoomRepository.findByParticipantIdOrderByLastMessageTimeDesc(userId);

        Set<Long> userIds =
                rooms.stream()
                        .flatMap(r -> r.getParticipantIds().stream())
                        .collect(Collectors.toSet());

        List<Long> userIdList = new ArrayList<>(userIds);

        Map<Long, User> userMap =
                userService.findAllByIds(userIdList)
                        .stream()
                        .collect(Collectors.toMap(User::getId, u -> u));


        Set<UUID> listingIds =
                rooms.stream()
                        .map(ChatRoom::getListingId)
                        .filter(id -> id != null)
                        .map(UUID::fromString)
                        .collect(Collectors.toSet());

        Map<UUID, Listing> listingMap =
                listingRepository.findAllById(listingIds)
                        .stream()
                        .collect(Collectors.toMap(Listing::getId, l -> l));

        Map<Long, Long> unreadCountMap =
                messageRepository.countUnreadMessagesByRoomIdsAndUserId(
                        rooms.stream().map(ChatRoom::getId).collect(Collectors.toList()),
                        userId
                );

        ChatEnrichmentContext context =
                new ChatEnrichmentContext(userMap, unreadCountMap, listingMap);

        return rooms.stream()
                .map(room -> {
                    ChatRoomDto dto = chatRoomMapper.toDto(room);

                    if (room.getListingId() != null) {
                        Listing listing = context.getListing(room.getListingId());
                        if (listing != null) {
                            dto.setListingTitle(listing.getTitle());
                        }
                    }

                    return chatRoomEnricher.enrich(room, userId, context, dto);
                })
                .collect(Collectors.toList());
    }


    @Transactional
    public ChatRoomDto createOrGetDirectChat(Long user1, Long user2) {
        Result<Void> validationResult = chatAuthorizationService.validateUsersExist(user1, user2);
        if (validationResult.isError()) {
            throw new IllegalArgumentException("Unable to create chat. Please ensure both users exist.");
        }

        return chatRoomRepository
                .findDirectChatRoom(user1, user2)
                .map(chatRoomMapper::toDto)
                .orElseGet(() -> {
                    ChatRoom room =
                            chatRoomMapper.toEntity(
                                    "Direct Chat",
                                    ChatRoom.RoomType.DIRECT,
                                    null
                            );
                    room.setParticipantIds(Set.of(user1, user2));
                    return chatRoomMapper.toDto(chatRoomRepository.save(room));
                });
    }

    @Transactional
    public ChatRoomDto createOrGetListingChat(Long userId, String listingId, String listingTitle) {
        Listing listing =
                listingRepository.findById(UUID.fromString(listingId)).orElseThrow();

        List<ChatRoom> existingRooms = chatRoomRepository.findListingChatRooms(listingId, userId);
        if (!existingRooms.isEmpty()) {
            ChatRoom existingRoom = existingRooms.get(0);
            if (existingRoom.getParticipantIds().contains(listing.getSeller().getId())) {
                return chatRoomMapper.toDto(existingRoom);
            }
        }

        ChatRoom room =
                chatRoomMapper.toEntity(
                        "Chat about: " + listingTitle,
                        ChatRoom.RoomType.LISTING,
                        listingId
                );

        room.setParticipantIds(Set.of(userId, listing.getSeller().getId()));
        return chatRoomMapper.toDto(chatRoomRepository.save(room));
    }


    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto dto) {

        Result<Void> contentResult = chatAuthorizationService.validateMessageContent(dto.getContent());
        if (contentResult.isError()) {
            throw new IllegalArgumentException("Message content is invalid. Please check your message and try again.");
        }

        Result<ChatRoom> roomResult = chatAuthorizationService.authorizeRoomAccess(
                        dto.getChatRoomId(),
                        dto.getSenderId()
                );
        if (roomResult.isError()) {
            throw new SecurityException("You do not have permission to send messages in this chat room.");
        }

        ChatRoom room = roomResult.getData();

        Result<Void> participantsResult = chatAuthorizationService.authorizeMessageParticipants(
                room,
                dto.getSenderId(),
                dto.getRecipientId()
        );
        if (participantsResult.isError()) {
            throw new SecurityException("Invalid message participants. Please check the recipient.");
        }

        Result<User> senderResult = userService.findById(dto.getSenderId());
        if (senderResult.isError()) {
            throw new IllegalArgumentException("Sender not found. Please try again.");
        }
        
        Result<User> recipientResult = userService.findById(dto.getRecipientId());
        if (recipientResult.isError()) {
            throw new IllegalArgumentException("Recipient not found. Please check the user.");
        }

        User sender = senderResult.getData();
        User recipient = recipientResult.getData();

        Message saved =
                messageRepository.save(
                        chatMessageMapper.toEntity(dto, sender, recipient)
                );

        chatRoomUpdater.updateLastMessage(room.getId());

        ChatMessageDto result = chatMessageMapper.toDto(saved);
        notificationService.sendMessage(result);
        return result;
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Result<Message> msgResult = chatAuthorizationService.validateMessageOwner(messageId, userId);
        if (msgResult.isError()) {
            throw new SecurityException("You do not have permission to delete this message.");
        }

        Message msg = msgResult.getData();
        messageRepository.delete(msg);
        chatRoomUpdater.updateLastMessage(msg.getChatRoomId());
    }

    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        Result<Void> validationResult = chatAuthorizationService.validateRoomParticipant(chatRoomId, userId);
        if (validationResult.isError()) {
            throw new SecurityException("You do not have permission to access this chat room.");
        }
        messageRepository.markMessagesAsRead(chatRoomId, userId);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getChatMessages(Long roomId, Long userId, Pageable pageable) {
        Result<Void> validationResult = chatAuthorizationService.validateRoomParticipant(roomId, userId);
        if (validationResult.isError()) {
            throw new SecurityException("You do not have permission to view messages in this chat room.");
        }
        return messageRepository
                .findByChatRoomIdOrderByCreatedAtAsc(roomId, pageable)
                .map(chatMessageMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getAllUserMessages(Long userId, Pageable pageable) {
        List<Long> roomIds =
                chatRoomRepository.findRoomIdsByParticipantId(userId);

        if (roomIds.isEmpty()) {
            return Page.empty(pageable);
        }

        return messageRepository
                .findByChatRoomIdInOrderByCreatedAtDesc(roomIds, pageable)
                .map(chatMessageMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Long getTotalUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadMessagesByRecipientId(userId);
    }

    @Transactional
    public void deleteConversation(Long chatRoomId, Long userId) {
        Result<ChatRoom> roomResult = chatAuthorizationService.authorizeRoomAccess(chatRoomId, userId);
        if (roomResult.isError()) {
            throw new SecurityException("You do not have permission to delete this conversation.");
        }

        ChatRoom room = roomResult.getData();
        messageRepository.deleteByChatRoomId(chatRoomId);
        chatRoomRepository.delete(room);
    }



}

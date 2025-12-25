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
        chatAuthorizationService.validateUsersExist(user1, user2);

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

        chatAuthorizationService.validateMessageContent(dto.getContent());

        ChatRoom room =
                chatAuthorizationService.authorizeRoomAccess(
                        dto.getChatRoomId(),
                        dto.getSenderId()
                );

        chatAuthorizationService.authorizeMessageParticipants(
                room,
                dto.getSenderId(),
                dto.getRecipientId()
        );

        User sender = userService.findById(dto.getSenderId());
        User recipient = userService.findById(dto.getRecipientId());

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
        Message msg =
                chatAuthorizationService.validateMessageOwner(messageId, userId);

        messageRepository.delete(msg);
        chatRoomUpdater.updateLastMessage(msg.getChatRoomId());
    }

    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        chatAuthorizationService.validateRoomParticipant(chatRoomId, userId);
        messageRepository.markMessagesAsRead(chatRoomId, userId);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getChatMessages(Long roomId, Pageable pageable) {
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
        ChatRoom room =
                chatAuthorizationService
                        .authorizeRoomAccess(chatRoomId, userId);

        messageRepository.deleteByChatRoomId(chatRoomId);
        chatRoomRepository.delete(room);
    }



}

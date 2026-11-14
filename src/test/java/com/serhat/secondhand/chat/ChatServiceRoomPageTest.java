package com.serhat.secondhand.chat;

import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.chat.application.ChatRoomUpdater;
import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.chat.dto.ChatRoomDto;
import com.serhat.secondhand.chat.enricher.ChatRoomEnricher;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.mapper.ChatMessageMapper;
import com.serhat.secondhand.chat.mapper.ChatRoomMapper;
import com.serhat.secondhand.chat.notification.ChatNotificationService;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.offer.repository.OfferRepository;
import com.serhat.secondhand.user.application.IUserService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ChatServiceRoomPageTest {

    private static final long USER = 7L;

    private final ChatRoomRepository roomRepository = mock(ChatRoomRepository.class);
    private final MessageRepository messageRepository = mock(MessageRepository.class);
    private final ChatRoomEnricher enricher = mock(ChatRoomEnricher.class);
    private final com.serhat.secondhand.user.application.UserBlockService userBlockService =
            mock(com.serhat.secondhand.user.application.UserBlockService.class);

    private final ChatService chatService = new ChatService(
            com.serhat.secondhand.user.RestrictionTestSupport.allowAll(), roomRepository, messageRepository, mock(ListingRepository.class), mock(IUserService.class),
            new ChatRoomMapper(), mock(ChatMessageMapper.class), enricher, mock(ChatNotificationService.class),
            mock(ChatRoomUpdater.class), mock(ChatAuthorizationService.class), mock(IOfferService.class),
            mock(OfferRepository.class), userBlockService);

    private static ChatRoom room(long id) {
        ChatRoom room = new ChatRoom();
        room.setId(id);
        room.setRoomName("room-" + id);
        room.setRoomType(ChatRoom.RoomType.DIRECT);
        room.setParticipantIds(new HashSet<>(Set.of(USER, 100 + id)));
        return room;
    }

    @Test
    void returnsOnePageInIdQueryOrderWithTotal() {
        Pageable pageable = PageRequest.of(1, 3);
        when(roomRepository.findRoomIdPageByParticipantId(USER, pageable))
                .thenReturn(new PageImpl<>(List.of(30L, 10L, 20L), pageable, 8));
        // The IN query returns rows in arbitrary order.
        when(roomRepository.findAllWithParticipantsByIdIn(List.of(30L, 10L, 20L)))
                .thenReturn(List.of(room(10), room(20), room(30)));
        when(enricher.enrich(any(), eq(USER), any(), any())).thenAnswer(i -> i.getArgument(3));

        Page<ChatRoomDto> page = chatService.getUserChatRooms(USER, pageable);

        assertThat(page.getContent()).extracting(ChatRoomDto::getId).containsExactly(30L, 10L, 20L);
        assertThat(page.getTotalElements()).isEqualTo(8);
        assertThat(page.getNumber()).isEqualTo(1);
        verify(messageRepository).countUnreadMessagesByRoomIdsAndUserId(List.of(30L, 10L, 20L), USER);
    }

    @Test
    void pageBeyondTheEnd_isEmptyWithoutLoadingRooms() {
        Pageable pageable = PageRequest.of(5, 20);
        when(roomRepository.findRoomIdPageByParticipantId(USER, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 8));

        Page<ChatRoomDto> page = chatService.getUserChatRooms(USER, pageable);

        assertThat(page.getContent()).isEmpty();
        assertThat(page.getTotalElements()).isEqualTo(8);
        assertThat(page.isLast()).isTrue();
        verify(roomRepository, never()).findAllWithParticipantsByIdIn(anyCollection());
    }
}

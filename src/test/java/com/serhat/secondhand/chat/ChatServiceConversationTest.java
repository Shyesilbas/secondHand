package com.serhat.secondhand.chat;

import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.chat.application.ChatRoomUpdater;
import com.serhat.secondhand.chat.application.ChatService;
import com.serhat.secondhand.chat.enricher.ChatRoomEnricher;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.ChatRoomHide;
import com.serhat.secondhand.chat.mapper.ChatMessageMapper;
import com.serhat.secondhand.chat.mapper.ChatRoomMapper;
import com.serhat.secondhand.chat.notification.ChatNotificationService;
import com.serhat.secondhand.chat.repository.ChatRoomHideRepository;
import com.serhat.secondhand.chat.repository.ChatRoomRepository;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.chat.util.ChatErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.offer.repository.OfferRepository;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.UserBlockService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * GV-29: deleting a conversation hides it for one side only, and deleting a message leaves a tombstone.
 * KK-10: listing chat input errors map to codes.
 */
class ChatServiceConversationTest {

    private static final long USER = 7L;
    private static final long SELLER = 9L;

    private final ChatRoomRepository roomRepository = mock(ChatRoomRepository.class);
    private final MessageRepository messageRepository = mock(MessageRepository.class);
    private final ListingRepository listingRepository = mock(ListingRepository.class);
    private final ChatAuthorizationService authorization = mock(ChatAuthorizationService.class);
    private final ChatRoomHideRepository hideRepository = mock(ChatRoomHideRepository.class);
    private final ChatService chatService = new ChatService(
            com.serhat.secondhand.user.RestrictionTestSupport.allowAll(), roomRepository, messageRepository,
            listingRepository, mock(IUserService.class), new ChatRoomMapper(), mock(ChatMessageMapper.class),
            mock(ChatRoomEnricher.class), mock(ChatNotificationService.class), mock(ChatRoomUpdater.class),
            authorization, mock(IOfferService.class), mock(OfferRepository.class), mock(UserBlockService.class),
            hideRepository);

    @Test
    void deleteConversationHidesForCallerAndKeepsMessages() {
        ChatRoom room = new ChatRoom();
        room.setId(3L);
        when(authorization.authorizeRoomAccess(3L, USER)).thenReturn(Result.success(room));
        when(hideRepository.findByChatRoomIdAndUserId(3L, USER)).thenReturn(Optional.empty());

        chatService.deleteConversation(3L, USER);

        ArgumentCaptor<ChatRoomHide> hide = ArgumentCaptor.forClass(ChatRoomHide.class);
        verify(hideRepository).save(hide.capture());
        assertThat(hide.getValue().getUserId()).isEqualTo(USER);
        assertThat(hide.getValue().getHiddenAt()).isNotNull();
        verify(roomRepository, never()).delete(any());
        verify(messageRepository, never()).delete(any());
        verify(messageRepository, never()).deleteAll();
    }

    @Test
    void hiddenConversationShowsOnlyLaterMessages() {
        LocalDateTime hiddenAt = LocalDateTime.now().minusHours(1);
        when(authorization.validateRoomParticipant(3L, USER)).thenReturn(Result.success());
        when(hideRepository.findByChatRoomIdAndUserId(3L, USER)).thenReturn(Optional.of(
                ChatRoomHide.builder().chatRoomId(3L).userId(USER).hiddenAt(hiddenAt).build()));
        when(messageRepository.findByChatRoomIdAndCreatedAtAfterOrderByCreatedAtDesc(eq(3L), eq(hiddenAt), any()))
                .thenReturn(Page.empty());

        chatService.getChatMessages(3L, USER, PageRequest.of(0, 20));

        verify(messageRepository, never()).findByChatRoomIdOrderByCreatedAtDesc(any(), any());
    }

    @Test
    void deleteMessageLeavesATombstoneWithTheOriginalText() {
        com.serhat.secondhand.chat.entity.Message message = new com.serhat.secondhand.chat.entity.Message();
        message.setId(40L);
        message.setChatRoomId(3L);
        message.setContent("Send the money to this IBAN");
        when(authorization.validateMessageOwner(40L, USER)).thenReturn(Result.success(message));

        chatService.deleteMessage(40L, USER);

        verify(messageRepository, never()).delete(any(com.serhat.secondhand.chat.entity.Message.class));
        verify(messageRepository).save(message);
        assertThat(message.isDeletedBySender()).isTrue();
        assertThat(message.getContent()).isEqualTo("Send the money to this IBAN");
    }

    @Test
    void tombstoneHidesTextFromClients() {
        com.serhat.secondhand.chat.entity.Message message = new com.serhat.secondhand.chat.entity.Message();
        User sender = new User();
        sender.setId(USER);
        message.setSender(sender);
        message.setRecipient(sender);
        message.setContent("secret");
        message.setDeletedBySenderAt(LocalDateTime.now());

        var dto = new ChatMessageMapper().toDto(message);

        assertThat(dto.isDeletedBySender()).isTrue();
        assertThat(dto.getContent()).isNull();
    }

    private Listing listing(ListingStatus status) {
        User seller = new User();
        seller.setId(SELLER);
        Listing listing = mock(Listing.class);
        when(listing.getSeller()).thenReturn(seller);
        when(listing.getStatus()).thenReturn(status);
        when(listing.isCanSendMessage()).thenReturn(true);
        when(listing.getTitle()).thenReturn("Stored title");
        return listing;
    }

    private static void assertCode(Runnable call, ChatErrorCodes code) {
        assertThatThrownBy(call::run).isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getErrorCode()).isEqualTo(code.getCode()));
    }

    @Test
    void unknownOrMalformedListingIsNotFound() {
        assertCode(() -> chatService.createOrGetListingChat(USER, UUID.randomUUID().toString()), ChatErrorCodes.LISTING_NOT_FOUND);
        assertCode(() -> chatService.createOrGetListingChat(USER, "not-a-uuid"), ChatErrorCodes.LISTING_NOT_FOUND);
    }

    @Test
    void sellerCannotOpenChatOnOwnListing() {
        UUID id = UUID.randomUUID();
        Listing listing = listing(ListingStatus.ACTIVE);
        when(listingRepository.findById(id)).thenReturn(Optional.of(listing));

        assertCode(() -> chatService.createOrGetListingChat(SELLER, id.toString()), ChatErrorCodes.CHAT_WITH_SELF);
    }

    @Test
    void newChatNeedsAPublicListingAndUsesTheStoredTitle() {
        UUID id = UUID.randomUUID();
        Listing draft = listing(ListingStatus.DRAFT);
        when(listingRepository.findById(id)).thenReturn(Optional.of(draft));
        assertCode(() -> chatService.createOrGetListingChat(USER, id.toString()), ChatErrorCodes.LISTING_NOT_AVAILABLE_FOR_CHAT);

        Listing active = listing(ListingStatus.ACTIVE);
        when(active.getId()).thenReturn(id);
        when(listingRepository.findById(id)).thenReturn(Optional.of(active));
        when(roomRepository.save(any(ChatRoom.class))).thenAnswer(inv -> {
            ChatRoom room = inv.getArgument(0);
            room.setId(11L);
            return room;
        });
        chatService.createOrGetListingChat(USER, id.toString());

        ArgumentCaptor<ChatRoom> saved = ArgumentCaptor.forClass(ChatRoom.class);
        verify(roomRepository).save(saved.capture());
        assertThat(saved.getValue().getRoomName()).isEqualTo("Chat about: Stored title");
    }

    @Test
    void directChatWithSelfIsRejected() {
        assertCode(() -> chatService.createOrGetDirectChat(USER, USER), ChatErrorCodes.CHAT_WITH_SELF);
    }
}

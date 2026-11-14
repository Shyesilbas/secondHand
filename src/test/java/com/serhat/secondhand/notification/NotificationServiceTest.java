package com.serhat.secondhand.notification;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.notification.application.NotificationService;
import com.serhat.secondhand.notification.application.NotificationWebSocketService;
import com.serhat.secondhand.notification.dto.NotificationDto;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.Notification;
import com.serhat.secondhand.notification.entity.NotificationEvent;
import com.serhat.secondhand.notification.entity.NotificationEventRead;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.notification.mapper.NotificationMapper;
import com.serhat.secondhand.notification.repository.NotificationEventReadRepository;
import com.serhat.secondhand.notification.repository.NotificationEventRepository;
import com.serhat.secondhand.notification.repository.NotificationFeedRepository;
import com.serhat.secondhand.notification.repository.NotificationRepository;
import com.serhat.secondhand.notification.util.NotificationErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private NotificationFeedRepository notificationFeedRepository;
    @Mock private NotificationEventRepository notificationEventRepository;
    @Mock private NotificationEventReadRepository notificationEventReadRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationMapper notificationMapper;
    @Mock private NotificationWebSocketService webSocketService;

    private NotificationService notificationService;
    private User user;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(
                notificationRepository,
                notificationFeedRepository,
                notificationEventRepository,
                notificationEventReadRepository,
                userRepository,
                notificationMapper,
                webSocketService
        );
        user = User.builder().id(7L).build();
    }

    @Test
    void createAndSend_missingUserReturnsNotFound_otherwiseSavesAndPushesWs() {
        NotificationRequest req = NotificationRequest.of(7L, NotificationType.ORDER_CREATED, "Title", "Msg", "/orders", "{}");
        when(userRepository.findById(7L)).thenReturn(Optional.empty());
        assertThat(notificationService.createAndSend(req).getErrorCode())
                .isEqualTo(NotificationErrorCodes.USER_NOT_FOUND.getCode());

        UUID notifId = UUID.randomUUID();
        Notification saved = Notification.builder().id(notifId).user(user).type(NotificationType.ORDER_CREATED).build();
        NotificationDto dto = NotificationDto.builder().id(notifId).userId(7L).build();
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);
        when(notificationMapper.toDto(saved)).thenReturn(dto);

        Result<NotificationDto> result = notificationService.createAndSend(req);

        assertThat(result.isSuccess()).isTrue();
        verify(webSocketService).sendNotificationToUser(7L, dto);
    }

    @Test
    void markAsRead_checksOwnershipAndHandlesBroadcastEvents() {
        UUID personalId = UUID.randomUUID();
        Notification foreign = Notification.builder().id(personalId).user(User.builder().id(99L).build()).isRead(false).build();
        when(notificationRepository.findById(personalId)).thenReturn(Optional.of(foreign));

        assertThat(notificationService.markAsRead(personalId, 7L).getErrorCode())
                .isEqualTo(NotificationErrorCodes.NOTIFICATION_NOT_BELONGS_TO_USER.getCode());

        Notification owned = Notification.builder().id(personalId).user(user).isRead(false).build();
        when(notificationRepository.findById(personalId)).thenReturn(Optional.of(owned));
        assertThat(notificationService.markAsRead(personalId, 7L).isSuccess()).isTrue();
        assertThat(owned.getIsRead()).isTrue();
        verify(notificationRepository).save(owned);

        UUID eventId = UUID.randomUUID();
        when(notificationRepository.findById(eventId)).thenReturn(Optional.empty());
        when(notificationEventRepository.findById(eventId)).thenReturn(Optional.of(NotificationEvent.builder().id(eventId).build()));
        when(notificationEventReadRepository.existsByEventIdAndUserId(eventId, 7L)).thenReturn(false);

        assertThat(notificationService.markAsRead(eventId, 7L).isSuccess()).isTrue();
        verify(notificationEventReadRepository).save(any(NotificationEventRead.class));
    }

    @Test
    void getUnreadCount_combinesPersonalAndNonNegativeBroadcastUnread() {
        when(notificationRepository.countByUser_IdAndIsReadFalseAndTypeNot(7L, NotificationType.AGREEMENT_UPDATED)).thenReturn(3L);
        when(notificationEventRepository.countByTypeNot(NotificationType.AGREEMENT_UPDATED)).thenReturn(5L);
        when(notificationEventReadRepository.countByUserIdForEventsWithTypeNot(7L, NotificationType.AGREEMENT_UPDATED)).thenReturn(2L);

        assertThat(notificationService.getUnreadCount(7L)).isEqualTo(6L);

        when(notificationEventReadRepository.countByUserIdForEventsWithTypeNot(7L, NotificationType.AGREEMENT_UPDATED)).thenReturn(9L);
        assertThat(notificationService.getUnreadCount(7L)).isEqualTo(3L);
    }

    @Test
    void markAllAsRead_marksPersonalNotificationsAndSavesUnreadEventReads() {
        Notification unread = Notification.builder().id(UUID.randomUUID()).user(user).isRead(false).build();
        UUID event1 = UUID.randomUUID();
        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(7L)).thenReturn(List.of(unread));
        when(notificationEventRepository.findUnreadEventIdsForUser(7L)).thenReturn(List.of(event1));

        notificationService.markAllAsRead(7L);

        assertThat(unread.getIsRead()).isTrue();
        verify(notificationRepository).flush();
        verify(notificationEventReadRepository).saveAll(anyList());
    }
}

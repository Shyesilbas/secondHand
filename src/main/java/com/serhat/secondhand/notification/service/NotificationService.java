package com.serhat.secondhand.notification.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.notification.dto.NotificationDto;
import com.serhat.secondhand.notification.util.NotificationErrorCodes;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.Notification;
import com.serhat.secondhand.notification.entity.NotificationEvent;
import com.serhat.secondhand.notification.entity.NotificationEventRead;
import com.serhat.secondhand.notification.mapper.NotificationMapper;
import com.serhat.secondhand.notification.repository.NotificationEventReadRepository;
import com.serhat.secondhand.notification.repository.NotificationEventRepository;
import com.serhat.secondhand.notification.repository.NotificationFeedRepository;
import com.serhat.secondhand.notification.repository.NotificationRepository;
import com.serhat.secondhand.notification.repository.projection.NotificationFeedRow;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationFeedRepository notificationFeedRepository;
    private final NotificationEventRepository notificationEventRepository;
    private final NotificationEventReadRepository notificationEventReadRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final NotificationWebSocketService webSocketService;

    public Result<NotificationDto> createAndSend(NotificationRequest request) {
        log.info("Creating notification for user: {}, type: {}", request.getUserId(), request.getType());

        User user = userRepository.findById(request.getUserId())
                .orElse(null);

        if (user == null) {
            return Result.error(NotificationErrorCodes.USER_NOT_FOUND);
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .actionUrl(request.getActionUrl())
                .metadata(request.getMetadata())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created with id: {}", saved.getId());

        NotificationDto dto = notificationMapper.toDto(saved);
        webSocketService.sendNotificationToUser(user.getId(), dto);

        return Result.success(dto);
    }

    public Result<NotificationDto> createBroadcast(NotificationRequest request) {
        NotificationEvent event = NotificationEvent.builder()
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .actionUrl(request.getActionUrl())
                .metadata(request.getMetadata())
                .build();
        NotificationEvent saved = notificationEventRepository.save(event);
        NotificationDto dto = NotificationDto.builder()
                .id(saved.getId())
                .userId(null)
                .type(saved.getType())
                .title(saved.getTitle())
                .message(saved.getMessage())
                .actionUrl(saved.getActionUrl())
                .metadata(saved.getMetadata())
                .isRead(false)
                .readAt(null)
                .createdAt(saved.getCreatedAt())
                .build();
        webSocketService.sendBroadcast(dto);
        return Result.success(dto);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        log.info("Fetching notifications for user: {}, page: {}, size: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
        Page<NotificationFeedRow> page = notificationFeedRepository.findFeed(userId, pageable);
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        long personal = notificationRepository.countByUserIdAndIsReadFalse(userId);
        long totalEvents = notificationEventRepository.count();
        long reads = notificationEventReadRepository.countByUserId(userId);
        long broadcastUnread = Math.max(0, totalEvents - reads);
        return personal + broadcastUnread;
    }

    public Result<Void> markAsRead(UUID notificationId, Long userId) {
        log.info("Marking notification {} as read for user: {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElse(null);

        if (notification != null) {
            if (!notification.getUser().getId().equals(userId)) {
                return Result.error(NotificationErrorCodes.NOTIFICATION_NOT_BELONGS_TO_USER);
            }

            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notification.setReadAt(LocalDateTime.now());
                notificationRepository.save(notification);
                log.info("Notification {} marked as read", notificationId);
            }
            return Result.success();
        }

        NotificationEvent event = notificationEventRepository.findById(notificationId).orElse(null);
        if (event == null) {
            return Result.error(NotificationErrorCodes.NOTIFICATION_NOT_FOUND);
        }

        boolean exists = notificationEventReadRepository.existsByEventIdAndUserId(notificationId, userId);
        if (!exists) {
            notificationEventReadRepository.save(NotificationEventRead.builder()
                    .eventId(notificationId)
                    .userId(userId)
                    .readAt(LocalDateTime.now())
                    .build());
        }
        return Result.success();
    }

    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);

        notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .forEach(notification -> {
                    notification.setIsRead(true);
                    notification.setReadAt(LocalDateTime.now());
                });

        notificationRepository.flush();
        log.info("All notifications marked as read for user: {}", userId);
    }

    public boolean existsByIdAndUserId(UUID notificationId, Long userId) {
        return notificationRepository.existsByIdAndUserId(notificationId, userId);
    }

    private NotificationDto toDto(NotificationFeedRow row) {
        return NotificationDto.builder()
                .id(row.getId())
                .userId(row.getUserId())
                .type(row.getType() != null ? com.serhat.secondhand.notification.entity.enums.NotificationType.valueOf(row.getType()) : null)
                .title(row.getTitle())
                .message(row.getMessage())
                .actionUrl(row.getActionUrl())
                .metadata(row.getMetadata())
                .isRead(row.getIsRead())
                .readAt(row.getReadAt())
                .createdAt(row.getCreatedAt())
                .build();
    }
}


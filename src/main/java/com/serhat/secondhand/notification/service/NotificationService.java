package com.serhat.secondhand.notification.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.notification.dto.NotificationDto;
import com.serhat.secondhand.notification.util.NotificationErrorCodes;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.Notification;
import com.serhat.secondhand.notification.mapper.NotificationMapper;
import com.serhat.secondhand.notification.repository.NotificationRepository;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;
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

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        log.info("Fetching notifications for user: {}, page: {}, size: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Result<Void> markAsRead(UUID notificationId, Long userId) {
        log.info("Marking notification {} as read for user: {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElse(null);

        if (notification == null) {
            return Result.error(NotificationErrorCodes.NOTIFICATION_NOT_FOUND);
        }

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
}


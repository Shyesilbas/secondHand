package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.notification.dto.NotificationDto;
import com.serhat.secondhand.notification.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationAgentContextAdapter implements AgentContextAdapter {

    private static final String SOURCE = "notifications";
    private static final int MAX_ITEMS = 5;

    private final INotificationService notificationService;

    @Override
    public AgentContextSection fetch(Long userId, AgentUiContextRequest uiContext) {
        try {
            Long unreadCount = notificationService.getUnreadCount(userId);
            List<NotificationDto> notifications = notificationService
                    .getUserNotifications(userId, PageRequest.of(0, MAX_ITEMS))
                    .getContent();

            String titles = notifications.stream()
                    .map(NotificationDto::getTitle)
                    .filter(v -> v != null && !v.isBlank())
                    .limit(3)
                    .collect(Collectors.joining(", "));

            String summary = "Unread notifications=" + unreadCount
                    + ", recent items=" + notifications.size()
                    + (titles.isBlank() ? "" : ", examples=" + titles);

            return new AgentContextSection(SOURCE, summary, "ok");
        } catch (Exception e) {
            log.warn("Failed to build notification context for user {}: {}", userId, e.getMessage());
            return new AgentContextSection(SOURCE, "Notification data is temporarily unavailable.", "unavailable");
        }
    }
}

package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.notification.dto.NotificationDto;
import com.serhat.secondhand.notification.application.INotificationService;
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
        if (userId == null) {
            return new AgentContextSection(SOURCE, "Unauthenticated user.", "skipped");
        }
        try {
            Long unreadCount = notificationService.getUnreadCount(userId);
            List<NotificationDto> notifications = notificationService
                    .getUserNotifications(userId, false, PageRequest.of(0, MAX_ITEMS))
                    .getContent();

            String details = notifications.stream()
                    .limit(MAX_ITEMS)
                    .map(NotificationAgentContextAdapter::formatNotification)
                    .collect(Collectors.joining("; "));

            String summary = "Unread notifications=" + unreadCount
                    + ", recent items=" + notifications.size()
                    + (details.isBlank() ? "" : ", details=[" + details + "]");

            return new AgentContextSection(SOURCE, summary, "ok");
        } catch (Exception e) {
            log.warn("Failed to build notification context for user {}: {}", userId, e.getMessage());
            return new AgentContextSection(SOURCE, "Notification data is temporarily unavailable.", "unavailable");
        }
    }

    private static String formatNotification(NotificationDto n) {
        String title = n.getTitle() != null ? n.getTitle().trim() : "-";
        String msg = n.getMessage() != null ? n.getMessage().trim().replace('\n', ' ') : "";
        if (msg.length() > 100) {
            msg = msg.substring(0, 100).trim() + "…";
        }
        return "%s(type=%s, read=%s%s)".formatted(
                title,
                n.getType() != null ? n.getType().name() : "-",
                Boolean.TRUE.equals(n.getIsRead()),
                msg.isBlank() ? "" : ", msg=" + msg
        );
    }
}

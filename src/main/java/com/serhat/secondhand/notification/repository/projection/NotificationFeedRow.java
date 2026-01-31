package com.serhat.secondhand.notification.repository.projection;

import java.time.LocalDateTime;
import java.util.UUID;

public interface NotificationFeedRow {
    UUID getId();
    Long getUserId();
    String getType();
    String getTitle();
    String getMessage();
    String getActionUrl();
    String getMetadata();
    Boolean getIsRead();
    LocalDateTime getReadAt();
    LocalDateTime getCreatedAt();
}


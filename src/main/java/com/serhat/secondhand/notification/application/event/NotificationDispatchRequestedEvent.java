package com.serhat.secondhand.notification.application.event;

import com.serhat.secondhand.notification.dto.NotificationRequest;

public record NotificationDispatchRequestedEvent(
        NotificationRequest request,
        String sourceModule,
        String dedupKey
) {
}


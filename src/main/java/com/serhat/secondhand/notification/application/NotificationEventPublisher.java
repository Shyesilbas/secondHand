package com.serhat.secondhand.notification.application;

import com.serhat.secondhand.notification.application.event.NotificationBroadcastRequestedEvent;
import com.serhat.secondhand.notification.application.event.NotificationDispatchRequestedEvent;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public void publishDispatch(NotificationRequest request, String sourceModule, String dedupKey) {
        eventPublisher.publishEvent(new NotificationDispatchRequestedEvent(request, sourceModule, dedupKey));
    }

    public void publishBroadcast(NotificationRequest request, String sourceModule, String dedupKey) {
        eventPublisher.publishEvent(new NotificationBroadcastRequestedEvent(request, sourceModule, dedupKey));
    }
}



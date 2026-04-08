package com.serhat.secondhand.notification.application;

import com.serhat.secondhand.notification.application.event.NotificationBroadcastRequestedEvent;
import com.serhat.secondhand.notification.application.event.NotificationDispatchRequestedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationDispatchRequestedEventListener {

    private final INotificationService notificationService;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handle(NotificationDispatchRequestedEvent event) {
        if (event == null || event.request() == null) {
            return;
        }

        var result = notificationService.createAndSend(event.request());
        if (result.isError()) {
            log.error("Async notification dispatch failed. sourceModule={}, dedupKey={}, error={}",
                    event.sourceModule(), event.dedupKey(), result.getMessage());
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handle(NotificationBroadcastRequestedEvent event) {
        if (event == null || event.request() == null) {
            return;
        }

        var result = notificationService.createBroadcast(event.request());
        if (result.isError()) {
            log.error("Async notification broadcast failed. sourceModule={}, dedupKey={}, error={}",
                    event.sourceModule(), event.dedupKey(), result.getMessage());
        }
    }
}



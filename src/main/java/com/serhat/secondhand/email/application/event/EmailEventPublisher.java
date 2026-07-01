package com.serhat.secondhand.email.application.event;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public <T> void publish(EmailEvent<T> event) {
        eventPublisher.publishEvent(event);
    }
}

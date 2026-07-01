package com.serhat.secondhand.email.application.event;

import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public abstract class EmailEvent<T> {
    private final User recipient;
    private final String subject;
    private final EmailType type;
    private final EmailPriority priority;
    private final LocalDateTime createdAt;
    private final T data;

    protected EmailEvent(User recipient, String subject, EmailType type, EmailPriority priority, T data) {
        this.recipient = recipient;
        this.subject = subject;
        this.type = type;
        this.priority = priority;
        this.data = data;
        this.createdAt = LocalDateTime.now();
    }

    public abstract String getTemplatePath();
}

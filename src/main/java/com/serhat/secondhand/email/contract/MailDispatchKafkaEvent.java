package com.serhat.secondhand.email.contract;

import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record MailDispatchKafkaEvent(
        UUID eventId,
        Long recipientUserId,
        String recipientEmail,
        String recipientName,
        String subject,
        EmailType emailType,
        EmailPriority priority,
        String templatePath,
        Map<String, Object> templateVariables,
        String customHtmlBody,
        LocalDateTime createdAt
) {
    public static MailDispatchKafkaEvent of(
            Long recipientUserId,
            String recipientEmail,
            String recipientName,
            String subject,
            EmailType emailType,
            EmailPriority priority,
            String templatePath,
            Map<String, Object> templateVariables
    ) {
        return new MailDispatchKafkaEvent(
                UUID.randomUUID(),
                recipientUserId,
                recipientEmail,
                recipientName,
                subject,
                emailType,
                priority != null ? priority : EmailPriority.NORMAL,
                templatePath,
                templateVariables,
                null,
                LocalDateTime.now()
        );
    }
}

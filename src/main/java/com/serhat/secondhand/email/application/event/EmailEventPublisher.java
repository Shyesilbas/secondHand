package com.serhat.secondhand.email.application.event;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.email.application.kafka.EmailKafkaProducer;
import com.serhat.secondhand.email.contract.MailDispatchKafkaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventPublisher {

    private final EmailKafkaProducer emailKafkaProducer;
    private final ObjectMapper objectMapper;

    public <T> void publish(EmailEvent<T> event) {
        if (event == null || event.getRecipient() == null) {
            log.warn("Attempted to publish null or recipient-less EmailEvent, skipping.");
            return;
        }

        Map<String, Object> templateVariables = new HashMap<>();
        if (event.getData() != null) {
            try {
                templateVariables = objectMapper.convertValue(event.getData(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.error("Failed to map event data to template variables for event: {}", event.getClass().getSimpleName(), e);
            }
        }

        if (!templateVariables.containsKey("userName") && event.getRecipient().getName() != null) {
            templateVariables.put("userName", event.getRecipient().getName());
        }

        MailDispatchKafkaEvent kafkaEvent = new MailDispatchKafkaEvent(
                UUID.randomUUID(),
                event.getRecipient().getId(),
                event.getRecipient().getEmail(),
                event.getRecipient().getName(),
                event.getSubject(),
                event.getType(),
                event.getPriority(),
                event.getTemplatePath(),
                templateVariables,
                null,
                event.getCreatedAt()
        );

        emailKafkaProducer.sendMailDispatch(kafkaEvent);
    }
}

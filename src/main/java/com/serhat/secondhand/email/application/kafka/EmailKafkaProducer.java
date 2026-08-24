package com.serhat.secondhand.email.application.kafka;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.email.contract.MailDispatchKafkaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public CompletableFuture<Void> sendMailDispatch(MailDispatchKafkaEvent event) {
        String key = event.recipientEmail() != null ? event.recipientEmail() : event.eventId().toString();

        log.info("Publishing MailDispatchKafkaEvent to Kafka topic: {} for recipient: {}, type: {}",
                KafkaConfig.MAIL_DISPATCH_TOPIC, event.recipientEmail(), event.emailType());

        return kafkaTemplate.send(KafkaConfig.MAIL_DISPATCH_TOPIC, key, event)
                .thenAccept(result -> log.info("Successfully published MailDispatchKafkaEvent: eventId={}, offset={}",
                        event.eventId(), result.getRecordMetadata().offset()))
                .exceptionally(ex -> {
                    log.error("Failed to publish MailDispatchKafkaEvent: eventId={}, recipient={}",
                            event.eventId(), event.recipientEmail(), ex);
                    throw new RuntimeException("Kafka publish failed for mail dispatch", ex);
                });
    }
}

package com.serhat.secondhand.email.application.kafka;

import com.serhat.secondhand.core.config.KafkaConfig;
import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.email.application.EmailSender;
import com.serhat.secondhand.email.application.EmailTemplateService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.contract.MailDispatchKafkaEvent;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailKafkaConsumer {

    private final EmailSender emailSender;
    private final EmailTemplateService templateService;
    private final EmailConfig emailConfig;
    private final UserRepository userRepository;
    private final ProcessedKafkaEventRepository processedKafkaEventRepository;

    @KafkaListener(
            topics = KafkaConfig.MAIL_DISPATCH_TOPIC,
            groupId = "${app.kafka.consumer.mail-group:mail-dispatch-consumers}"
    )
    @Transactional
    public void consumeMailDispatch(MailDispatchKafkaEvent event) {
        log.info("Received MailDispatchKafkaEvent: eventId={}, recipient={}, type={}",
                event.eventId(), event.recipientEmail(), event.emailType());

        // 1. Atomic DB-Level Idempotency Check: INSERT ON CONFLICT DO NOTHING
        String dedupeKey = "mail:dispatch:" + event.eventId();
        int inserted = processedKafkaEventRepository.insertIfNotExists(dedupeKey, "mail-dispatch-consumers");
        if (inserted == 0) {
            log.warn("Duplicate MailDispatchKafkaEvent detected for eventId: {}. Skipping duplicate dispatch.", event.eventId());
            return;
        }

        try {
            // 2. Render content: use custom body or Thymeleaf template engine
            String content;
            if (event.customHtmlBody() != null && !event.customHtmlBody().isBlank()) {
                content = event.customHtmlBody();
            } else if (event.templatePath() != null && !event.templatePath().isBlank()) {
                content = templateService.render(event.templatePath(), event.templateVariables());
            } else {
                content = "<p>" + (event.subject() != null ? event.subject() : "") + "</p>";
            }

            // 3. Resolve user if recipientUserId is provided
            var user = event.recipientUserId() != null 
                    ? userRepository.findById(event.recipientUserId()).orElse(null) 
                    : null;

            // 4. Build Email entity (transient, id=null)
            Email email = Email.builder()
                    .user(user)
                    .recipientEmail(event.recipientEmail())
                    .senderEmail(emailConfig.getSender())
                    .subject(event.subject())
                    .content(content)
                    .emailType(event.emailType())
                    .status(EmailStatus.PENDING)
                    .retryCount(0)
                    .priority(event.priority())
                    .createdAt(LocalDateTime.now())
                    .build();

            // 5. Transmit via EmailSender (persists in dedicated transaction)
            emailSender.sendEmail(email);

        } catch (Exception ex) {
            log.error("Error processing MailDispatchKafkaEvent for eventId: {}", event.eventId(), ex);
            throw ex; // Allow Kafka error handler / DLQ mechanism to handle
        }
    }
}

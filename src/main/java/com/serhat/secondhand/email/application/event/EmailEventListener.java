package com.serhat.secondhand.email.application.event;

import com.serhat.secondhand.email.application.EmailContentBuilder;
import com.serhat.secondhand.email.application.EmailSender;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {

    private final EmailRepository emailRepository;
    private final EmailContentBuilder contentBuilder;
    private final EmailSender emailSender;
    private final EmailConfig emailConfig;

    @Async("emailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public <T> void handleEmailEvent(EmailEvent<T> event) {
        if (event == null || event.getRecipient() == null) {
            log.warn("Received empty or recipient-less EmailEvent, skipping.");
            return;
        }

        log.info("Processing EmailEvent asynchronously for user: {}, type: {}", event.getRecipient().getEmail(), event.getType());

        try {
            // 1. Build template/content
            String content = contentBuilder.buildContent(event);

            // 2. Persist initial PENDING inbox/outbox record
            Email email = Email.builder()
                    .user(event.getRecipient())
                    .recipientEmail(event.getRecipient().getEmail())
                    .senderEmail(emailConfig.getSender())
                    .subject(event.getSubject())
                    .content(content)
                    .emailType(event.getType())
                    .status(EmailStatus.PENDING)
                    .retryCount(0)
                    .priority(event.getPriority())
                    .createdAt(LocalDateTime.now())
                    .build();

            email = emailRepository.save(email);
            log.info("Saved initial email record with ID: {} for user: {}", email.getId(), event.getRecipient().getEmail());

            // 3. Delegate to EmailSender (running in separate transaction)
            emailSender.sendEmail(email);

        } catch (Exception e) {
            log.error("Failed to process email event: {}", e.getMessage(), e);
        }
    }
}

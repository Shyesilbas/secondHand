package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Delivers an email to the recipient's in-app inbox: the {@code emails} table, read through
 * {@code /api/v1/emails/my-emails}. There is no SMTP delivery.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailSender {

    private final EmailRepository emailRepository;
    private final EmailMetrics emailMetrics;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendEmail(Email emailInput) {
        Email email = emailInput.getId() != null
                ? emailRepository.findById(emailInput.getId()).orElse(emailInput)
                : emailInput;

        try {
            email.setStatus(EmailStatus.SENT);
            email.setSentAt(LocalDateTime.now());
            email.setErrorMessage(null);
            emailRepository.save(email);
        } catch (RuntimeException e) {
            // The caller (Kafka consumer) rethrows, so the event is retried and then sent to the DLT.
            emailMetrics.recordFailure(email.getEmailType(), e.getClass().getSimpleName());
            throw e;
        }

        emailMetrics.recordSuccess(email.getEmailType());
        log.info("Email delivered to in-app inbox: to={}, type={}", email.getRecipientEmail(), email.getEmailType());
    }
}

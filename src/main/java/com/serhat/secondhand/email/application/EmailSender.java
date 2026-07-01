package com.serhat.secondhand.email.application;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailSender {

    private final EmailRepository emailRepository;
    private final RateLimitedEmailSender rateLimitedEmailSender;
    private final EmailMetrics emailMetrics;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.mock:true}")
    private boolean mockMode;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendEmail(Email email) {
        log.info("Preparing to send outbound email to {}, type: {}", email.getRecipientEmail(), email.getEmailType());

        // 1. Rate Limiting check
        rateLimitedEmailSender.acquire();

        try {
            if (mockMode || mailSender == null) {
                log.info("\n=== [MOCK EMAIL TRANSMISSION] ===\n" +
                         "To: {}\n" +
                         "From: {}\n" +
                         "Subject: {}\n" +
                         "Type: {}\n" +
                         "=================================", 
                         email.getRecipientEmail(), email.getSenderEmail(), email.getSubject(), email.getEmailType());
            } else {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(email.getSenderEmail());
                helper.setTo(email.getRecipientEmail());
                helper.setSubject(email.getSubject());
                helper.setText(email.getContent(), true); // Send as HTML

                mailSender.send(message);
                log.info("Email transmitted successfully via SMTP to: {}", email.getRecipientEmail());
            }

            // Update entity to SENT
            email.setStatus(EmailStatus.SENT);
            email.setSentAt(LocalDateTime.now());
            email.setErrorMessage(null);
            emailRepository.save(email);

            // Record metrics
            emailMetrics.recordSuccess(email.getEmailType());

        } catch (Exception e) {
            log.error("Failed to transmit email to {}: {}", email.getRecipientEmail(), e.getMessage());

            // Update entity to FAILED
            email.setStatus(EmailStatus.FAILED);
            email.setRetryCount(email.getRetryCount() + 1);
            email.setErrorMessage(e.getMessage());
            emailRepository.save(email);

            // Record metrics
            emailMetrics.recordFailure(email.getEmailType(), e.getClass().getSimpleName());

            throw new RuntimeException("Email transmission failed: " + e.getMessage(), e);
        }
    }
}

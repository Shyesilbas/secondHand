package com.serhat.secondhand.email.application.scheduler;

import com.serhat.secondhand.email.application.EmailSender;
import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailRetryScheduler {

    private final EmailRepository emailRepository;
    private final EmailSender emailSender;

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void retryFailedEmails() {
        log.debug("Starting scheduled job to retry failed emails.");
        List<Email> failedEmails = emailRepository.findTop50FailedEmails(EmailStatus.FAILED, 3);
        if (failedEmails.isEmpty()) {
            return;
        }

        log.info("Found {} failed emails eligible for retry check.", failedEmails.size());
        LocalDateTime now = LocalDateTime.now();

        for (Email email : failedEmails) {
            // Exponential backoff calculation: backoff = 2^retryCount * 5 minutes
            long minutesSinceCreation = Duration.between(email.getCreatedAt(), now).toMinutes();
            long backoffLimit = (long) Math.pow(2, email.getRetryCount()) * 5;

            if (minutesSinceCreation < backoffLimit) {
                log.debug("Email ID {} is not yet ready for retry (waiting for {} min backoff, elapsed {} min).",
                        email.getId(), backoffLimit, minutesSinceCreation);
                continue;
            }

            log.info("Retrying email transmission for ID: {}, recipient: {}, attempt: {}",
                    email.getId(), email.getRecipientEmail(), email.getRetryCount() + 1);
            try {
                emailSender.sendEmail(email);
            } catch (Exception e) {
                log.warn("Retry attempt failed for email ID {}: {}", email.getId(), e.getMessage());
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * *") // Daily at 2:00 AM
    @Transactional
    public void purgeOldEmails() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        log.info("Purging outbound email history logs older than 30 days. Cutoff date: {}", cutoffDate);
        try {
            int deletedCount = emailRepository.deleteOldEmails(cutoffDate);
            log.info("Successfully deleted {} old email history log records.", deletedCount);
        } catch (Exception e) {
            log.error("Failed to purge old email records: {}", e.getMessage(), e);
        }
    }
}

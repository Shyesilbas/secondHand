package com.serhat.secondhand.email.application.scheduler;

import com.serhat.secondhand.email.domain.repository.EmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailPurgeScheduler {

    private final EmailRepository emailRepository;

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

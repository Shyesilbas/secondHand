package com.serhat.secondhand.complaint.queue;

import com.serhat.secondhand.complaint.AppealStatus;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executor;

/**
 * Hourly batch: takes up to {@code app.moderation.worker.batch-size} due complaints from the Redis queue
 * and hands each to the {@link ComplaintReviewHandler}, then as many pending appeals to the
 * {@link AppealReviewHandler}. Only one instance runs at a time
 * ({@link ComplaintWorkerLock}). Disabled by default; enabling it without a handler bean fails startup.
 */
@Component
@ConditionalOnProperty(prefix = "app.moderation.worker", name = "enabled", havingValue = "true")
@Slf4j
public class ComplaintReviewWorker {

    private final ComplaintReviewQueue queue;
    private final ComplaintWorkerLock lock;
    private final ComplaintRepository complaintRepository;
    private final ComplaintReviewHandler reviewHandler;
    private final AppealReviewHandler appealHandler;
    private final ComplaintModerationProperties properties;
    private final Executor moderationExecutor;

    public ComplaintReviewWorker(ComplaintReviewQueue queue, ComplaintWorkerLock lock,
                                 ComplaintRepository complaintRepository, ComplaintReviewHandler reviewHandler,
                                 AppealReviewHandler appealHandler,
                                 ComplaintModerationProperties properties,
                                 @Qualifier("moderationExecutor") Executor moderationExecutor) {
        this.queue = queue;
        this.lock = lock;
        this.complaintRepository = complaintRepository;
        this.reviewHandler = reviewHandler;
        this.appealHandler = appealHandler;
        this.properties = properties;
        this.moderationExecutor = moderationExecutor;
    }

    /** Hands the batch to {@code moderationExecutor}; the scheduler thread returns immediately. */
    @Scheduled(cron = "${app.moderation.worker.cron:0 0 * * * *}")
    public void scheduleBatch() {
        moderationExecutor.execute(this::processDueComplaints);
    }

    public void processDueComplaints() {
        ComplaintModerationProperties.Worker config = properties.getWorker();
        Optional<String> token = lock.tryAcquire(config.getLockTtl());
        if (token.isEmpty()) {
            log.info("Complaint review worker skipped, another instance holds the lock");
            return;
        }
        try {
            LocalDateTime now = LocalDateTime.now();
            runBatch(now, config);
            runAppealBatch(now, config);
        } finally {
            lock.release(token.get());
        }
    }

    int runBatch(LocalDateTime now, ComplaintModerationProperties.Worker config) {
        List<String> due = queue.due(now, config.getBatchSize());
        int reviewed = 0;
        for (String complaintId : due) {
            Optional<ComplaintStatus> status = complaintRepository.findStatusById(complaintId);
            if (status.isEmpty() || status.get() != ComplaintStatus.PENDING) {
                // Deleted or already handled: nothing left to review.
                queue.remove(complaintId);
                continue;
            }
            try {
                reviewHandler.review(complaintId);
                queue.remove(complaintId);
                reviewed++;
            } catch (Exception e) {
                log.error("Review of complaint {} failed, retrying after {}", complaintId, config.getRetryDelay(), e);
                queue.schedule(complaintId, now.plus(config.getRetryDelay()));
            }
        }
        log.info("Complaint review worker finished: {} due, {} reviewed", due.size(), reviewed);
        return reviewed;
    }

    int runAppealBatch(LocalDateTime now, ComplaintModerationProperties.Worker config) {
        List<String> due = queue.dueAppeals(now, config.getBatchSize());
        int reviewed = 0;
        for (String complaintId : due) {
            Optional<AppealStatus> status = complaintRepository.findAppealStatusById(complaintId);
            if (status.isEmpty() || status.get() != AppealStatus.PENDING) {
                queue.removeAppeal(complaintId);
                continue;
            }
            try {
                appealHandler.reviewAppeal(complaintId);
                queue.removeAppeal(complaintId);
                reviewed++;
            } catch (Exception e) {
                log.error("Appeal review of complaint {} failed, retrying after {}", complaintId, config.getRetryDelay(), e);
                queue.scheduleAppeal(complaintId, now.plus(config.getRetryDelay()));
            }
        }
        log.info("Appeal review worker finished: {} due, {} reviewed", due.size(), reviewed);
        return reviewed;
    }
}

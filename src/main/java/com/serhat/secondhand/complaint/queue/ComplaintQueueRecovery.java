package com.serhat.secondhand.complaint.queue;

import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.complaint.repository.ComplaintRepository.QueuedComplaint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;

/**
 * Rebuilds the review and appeal queues from PostgreSQL on startup (Redis restart, lost write after commit).
 * Uses ZADD NX, so complaints already queued keep their score, including retry delays. Reviews that
 * stayed INVESTIGATING longer than {@code app.moderation.review.stale-investigation} (crash mid-review)
 * are released to PENDING first.
 */
@Component
@Slf4j
public class ComplaintQueueRecovery {

    static final int PAGE_SIZE = 500;

    public ComplaintQueueRecovery(ComplaintRepository complaintRepository, ComplaintReviewQueue queue,
                                  ComplaintModerationProperties properties, PlatformTransactionManager transactionManager) {
        this.complaintRepository = complaintRepository;
        this.queue = queue;
        this.properties = properties;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    private final ComplaintRepository complaintRepository;
    private final ComplaintReviewQueue queue;
    private final ComplaintModerationProperties properties;
    private final TransactionTemplate transactionTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            Integer released = transactionTemplate.execute(status -> complaintRepository.releaseStaleClaims(
                    LocalDateTime.now().minus(properties.getReview().getStaleInvestigation())));
            if (released != null && released > 0) {
                log.warn("{} complaint review(s) stuck in INVESTIGATING were released back to PENDING", released);
            }
            int added = recover();
            log.info("Complaint review queue recovery finished, {} complaint(s) re-queued", added);
        } catch (Exception e) {
            log.error("Complaint review queue recovery failed", e);
        }
    }

    int recover() {
        int added = 0;
        Pageable page = PageRequest.of(0, PAGE_SIZE);
        Slice<QueuedComplaint> slice;
        do {
            slice = complaintRepository.findPendingForQueue(page);
            for (QueuedComplaint complaint : slice) {
                if (queue.scheduleIfAbsent(complaint.getId(), complaint.getEligibleForReviewAt())) {
                    added++;
                }
            }
            page = slice.nextPageable();
        } while (slice.hasNext());
        page = PageRequest.of(0, PAGE_SIZE);
        do {
            slice = complaintRepository.findPendingAppealsForQueue(page);
            for (QueuedComplaint appeal : slice) {
                if (queue.scheduleAppealIfAbsent(appeal.getId(), appeal.getEligibleForReviewAt())) {
                    added++;
                }
            }
            page = slice.nextPageable();
        } while (slice.hasNext());
        return added;
    }
}

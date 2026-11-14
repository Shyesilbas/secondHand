package com.serhat.secondhand.complaint.queue;

import com.serhat.secondhand.complaint.application.event.AppealSubmittedEvent;
import com.serhat.secondhand.complaint.application.event.ComplaintSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Queues a complaint only once its row is committed, so the worker never sees an id without a row. */
@Component
@RequiredArgsConstructor
@Slf4j
public class ComplaintQueueListener {

    private final ComplaintReviewQueue queue;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onComplaintSubmitted(ComplaintSubmittedEvent event) {
        try {
            queue.schedule(event.complaintId(), event.eligibleForReviewAt());
        } catch (Exception e) {
            // The row is PENDING in PostgreSQL; ComplaintQueueRecovery re-queues it on the next start.
            log.error("Failed to queue complaint {} for review; it will be re-queued on restart",
                    event.complaintId(), e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAppealSubmitted(AppealSubmittedEvent event) {
        try {
            queue.scheduleAppeal(event.complaintId(), event.submittedAt());
        } catch (Exception e) {
            log.error("Failed to queue appeal of complaint {}; it will be re-queued on restart",
                    event.complaintId(), e);
        }
    }
}

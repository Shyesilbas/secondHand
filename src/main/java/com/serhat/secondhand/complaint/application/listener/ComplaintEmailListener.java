package com.serhat.secondhand.complaint.application.listener;

import com.serhat.secondhand.complaint.ViolationCategory;
import com.serhat.secondhand.complaint.application.ComplaintEmailNotifier;
import com.serhat.secondhand.complaint.application.event.AppealReviewedEvent;
import com.serhat.secondhand.complaint.application.event.ComplaintReviewedEvent;
import com.serhat.secondhand.complaint.application.event.ComplaintSubmittedEvent;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
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
public class ComplaintEmailListener {

    private final ComplaintEmailNotifier notifier;
    private final ComplaintModerationProperties properties;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onComplaintSubmitted(ComplaintSubmittedEvent event) {
        try {
            notifier.sendSubmitted(event.complainer(), event.complaintId(), event.targetLabel(),
                    event.reason(), event.eligibleForReviewAt());
        } catch (Exception e) {
            log.error("Failed to send complaint-submitted email for complaint {}", event.complaintId(), e);
        }
    }

    /** Outcome to the complainer and, when a penalty was applied, the sanction email to the reported user. */
    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onComplaintReviewed(ComplaintReviewedEvent event) {
        try {
            notifier.sendOutcome(event.complainer(), event.complaintId(), event.status(), event.targetLabel(),
                    event.adminNotes(), event.resolvedAt());
        } catch (Exception e) {
            log.error("Failed to send outcome email for complaint {}", event.complaintId(), e);
        }
        try {
            LocalDateTime appealDeadline = event.penalty().isAppealable()
                    ? event.resolvedAt().plus(properties.getReview().getAppealWindow())
                    : null;
            notifier.sendSanction(event.complainedUser(), event.penalty(), new ComplaintEmailNotifier.SanctionDetails(
                    event.complaintId(), event.violationCategory(), event.adminNotes(), event.listingTitle(),
                    event.bannedUntil(), event.warningCount(),
                    properties.getReview().getWarningEscalationThreshold(), appealDeadline));
        } catch (Exception e) {
            log.error("Failed to send sanction email for complaint {}", event.complaintId(), e);
        }
        try {
            notifier.sendSanction(event.complainer(), event.complainerPenalty(), new ComplaintEmailNotifier.SanctionDetails(
                    event.complaintId(), ViolationCategory.MALICIOUS_REPORT, event.adminNotes(), null,
                    event.complainerBannedUntil(), null, null, null));
        } catch (Exception e) {
            log.error("Failed to send bad-faith sanction email for complaint {}", event.complaintId(), e);
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAppealReviewed(AppealReviewedEvent event) {
        try {
            notifier.sendAppealOutcome(event.appellant(), event.complaintId(), event.appealStatus(),
                    event.penaltyReversed(), event.explanation());
        } catch (Exception e) {
            log.error("Failed to send appeal outcome email for complaint {}", event.complaintId(), e);
        }
    }
}

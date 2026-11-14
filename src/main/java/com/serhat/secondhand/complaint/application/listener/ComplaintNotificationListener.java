package com.serhat.secondhand.complaint.application.listener;

import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.application.event.AppealReviewedEvent;
import com.serhat.secondhand.complaint.application.event.ComplaintReviewedEvent;
import com.serhat.secondhand.notification.application.INotificationService;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** In-app (bell) notifications for moderation decisions; the emails go through {@link ComplaintEmailListener}. */
@Component
@RequiredArgsConstructor
@Slf4j
public class ComplaintNotificationListener {

    private final INotificationService notificationService;
    private final NotificationTemplateCatalog templates;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onComplaintReviewed(ComplaintReviewedEvent event) {
        send(event.complaintId(), templates.complaintReviewed(event.complainer().getId(), event.complaintId(),
                event.status().name()));
        if (event.penalty() != PenaltyAction.NONE) {
            send(event.complaintId(), templates.moderationSanction(event.complainedUser().getId(), event.complaintId(),
                    event.penalty().name(), event.bannedUntil(), false));
        }
        if (event.complainerPenalty() != PenaltyAction.NONE) {
            send(event.complaintId(), templates.moderationSanction(event.complainer().getId(), event.complaintId(),
                    event.complainerPenalty().name(), event.complainerBannedUntil(), true));
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAppealReviewed(AppealReviewedEvent event) {
        send(event.complaintId(), templates.moderationAppealDecided(event.appellant().getId(), event.complaintId(),
                event.appealStatus().name(), event.penaltyReversed()));
    }

    private void send(String complaintId, NotificationRequest request) {
        try {
            var result = notificationService.createAndSend(request);
            if (result.isError()) {
                log.warn("Moderation notification {} for complaint {} failed: {}", request.getType(), complaintId,
                        result.getMessage());
            }
        } catch (Exception e) {
            log.error("Moderation notification for complaint {} failed", complaintId, e);
        }
    }
}

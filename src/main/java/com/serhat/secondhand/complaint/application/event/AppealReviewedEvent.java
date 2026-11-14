package com.serhat.secondhand.complaint.application.event;

import com.serhat.secondhand.complaint.AppealStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.user.domain.entity.User;

/** Snapshot of an appeal decision, published inside the decision transaction. */
public record AppealReviewedEvent(
        String complaintId,
        User appellant,
        AppealStatus appealStatus,
        PenaltyAction originalPenalty,
        boolean penaltyReversed,
        String explanation
) {
}

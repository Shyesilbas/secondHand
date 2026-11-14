package com.serhat.secondhand.complaint.application.event;

import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.ViolationCategory;
import com.serhat.secondhand.user.domain.entity.User;

import java.time.LocalDateTime;

/**
 * Snapshot of an Aura decision, published inside the decision transaction. {@code complainerPenalty} is
 * {@link PenaltyAction#NONE} unless the complaint was found to be a bad-faith report.
 */
public record ComplaintReviewedEvent(
        String complaintId,
        User complainer,
        User complainedUser,
        String targetLabel,
        String listingTitle,
        ComplaintStatus status,
        PenaltyAction penalty,
        ViolationCategory violationCategory,
        String adminNotes,
        LocalDateTime resolvedAt,
        LocalDateTime bannedUntil,
        int warningCount,
        PenaltyAction complainerPenalty,
        LocalDateTime complainerBannedUntil
) {
}

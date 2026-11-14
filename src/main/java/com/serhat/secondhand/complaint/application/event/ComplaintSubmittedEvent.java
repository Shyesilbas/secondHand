package com.serhat.secondhand.complaint.application.event;

import com.serhat.secondhand.user.domain.entity.User;

import java.time.LocalDateTime;

/**
 * Published inside the complaint-creation transaction; listeners act after commit.
 * Carries a snapshot so listeners never touch lazy associations outside the transaction.
 */
public record ComplaintSubmittedEvent(
        User complainer,
        String complaintId,
        String targetLabel,
        String reason,
        LocalDateTime eligibleForReviewAt
) {
}

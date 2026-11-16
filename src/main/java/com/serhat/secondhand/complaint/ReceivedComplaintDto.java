package com.serhat.secondhand.complaint;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A complaint as the complained-about user sees it. Leaves out everything that identifies or exposes the
 * complainer (name, description, evidence images, bad-faith outcome) and the AI review internals, so a reported
 * user cannot retaliate. The decision rationale ({@code adminNotes}) stays: the sanction email already carries it
 * and the user needs it to appeal.
 */
public record ReceivedComplaintDto(
        String complaintId,
        UUID listingId,
        String listingTitle,
        String reason,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime updatedAt,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime resolvedAt,
        ComplaintStatus status,
        String adminNotes,
        LocalDateTime eligibleForReviewAt,
        Long reportedMessageId,
        ViolationCategory violationCategory,
        PenaltyAction penaltyAction,
        AppealStatus appealStatus,
        String appealReason,
        LocalDateTime appealSubmittedAt,
        LocalDateTime appealReviewedAt,
        String appealDecisionNotes,
        /** Null when the decision cannot be appealed. */
        LocalDateTime appealDeadline,
        /** The user's own reported chat message; null when no message is reported or it was deleted. */
        String reportedMessageContent
) {
}

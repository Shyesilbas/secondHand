package com.serhat.secondhand.complaint;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ComplaintDto(
        String complaintId,
        String complainerId,
        String complainedUserId,
        UUID listingId,
        String listingTitle,
        String reason,
        String description,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime updatedAt,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime resolvedAt,
        ComplaintStatus status,
        String adminNotes,
        LocalDateTime eligibleForReviewAt,
        Long chatRoomId,
        Long reportedMessageId,
        List<String> evidenceImageUrls,
        ViolationCategory violationCategory,
        PenaltyAction penaltyAction,
        BigDecimal aiConfidenceScore,
        LocalDateTime aiReviewedAt,
        AppealStatus appealStatus,
        String appealReason,
        LocalDateTime appealSubmittedAt,
        LocalDateTime appealReviewedAt,
        String appealDecisionNotes,
        /** Null when the decision cannot be appealed. */
        LocalDateTime appealDeadline,
        boolean badFaithReport,
        PenaltyAction complainerPenaltyAction
) {
}

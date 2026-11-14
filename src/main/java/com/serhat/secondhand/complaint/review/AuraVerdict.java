package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.ViolationCategory;

import java.math.BigDecimal;

/** Aura's structured answer for one complaint, already checked by {@link AuraVerdictParser}. */
public record AuraVerdict(
        ComplaintStatus verdict,
        ViolationCategory violationCategory,
        BigDecimal confidenceScore,
        Severity severity,
        PenaltyAction penaltyAction,
        String adminNotes,
        String actionExplanation,
        boolean badFaithReport,
        boolean coordinatedAttackSuspected
) {
}

package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;

/**
 * Final outcome after the sanction ladder rules. {@code adjustment} says why it differs from what Aura
 * asked for, or is null when Aura's penalty was applied as is.
 */
public record SanctionDecision(ComplaintStatus status, PenaltyAction penalty, String adjustment) {
}

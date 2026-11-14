package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.complaint.AppealStatus;

import java.math.BigDecimal;

/**
 * Aura's answer to an appeal, already checked by {@link AppealVerdictParser}.
 *
 * @param explanation   formal Turkish text for the appellant
 * @param internalNotes English reasoning for the logs
 */
public record AppealVerdict(AppealStatus decision, BigDecimal confidenceScore, String explanation,
                            String internalNotes) {
}

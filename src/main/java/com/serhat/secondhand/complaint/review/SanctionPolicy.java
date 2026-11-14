package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Sanction ladder (proposal section 5). Pure: turns Aura's verdict plus the user's record into the
 * penalty that is actually applied. Order matters: escalation first, the low-confidence cap last, so
 * a doubtful verdict can never end in a ban.
 */
@Component
@RequiredArgsConstructor
public class SanctionPolicy {

    private final ComplaintModerationProperties properties;

    public SanctionDecision decide(AuraVerdict verdict, int effectiveWarnings, long priorTempBans,
                                   boolean listingComplaint) {
        if (verdict.verdict() == ComplaintStatus.DISMISSED) {
            return new SanctionDecision(ComplaintStatus.DISMISSED, PenaltyAction.NONE, null);
        }
        ComplaintModerationProperties.Review rules = properties.getReview();
        PenaltyAction requested = verdict.penaltyAction();
        PenaltyAction penalty = requested;
        String adjustment = null;

        if (penalty == PenaltyAction.NONE) {
            // Aura found a violation but asked for nothing: the lightest step still records it.
            penalty = PenaltyAction.WARNING;
            adjustment = "violation without penalty recorded as WARNING";
        }
        if (penalty == PenaltyAction.LISTING_SUSPENDED && !listingComplaint) {
            penalty = PenaltyAction.WARNING;
            adjustment = "no listing on the complaint, LISTING_SUSPENDED applied as WARNING";
        }
        if ((penalty == PenaltyAction.WARNING || penalty == PenaltyAction.LISTING_SUSPENDED)
                && effectiveWarnings >= rules.getWarningEscalationThreshold()) {
            penalty = PenaltyAction.TEMP_BAN_7_DAYS;
            adjustment = effectiveWarnings + " active warnings, escalated to TEMP_BAN_7_DAYS";
        }
        if (penalty == PenaltyAction.TEMP_BAN_7_DAYS && priorTempBans >= rules.getTempBansBeforePermBan()) {
            penalty = PenaltyAction.PERM_BAN;
            adjustment = priorTempBans + " prior temporary bans, escalated to PERM_BAN";
        }
        if (verdict.confidenceScore().compareTo(rules.getMinConfidence()) < 0
                && penalty.ordinal() > PenaltyAction.WARNING.ordinal()) {
            penalty = PenaltyAction.WARNING;
            adjustment = "confidence " + verdict.confidenceScore() + " below " + rules.getMinConfidence()
                    + ", capped at WARNING";
        }
        return new SanctionDecision(ComplaintStatus.RESOLVED, penalty, adjustment);
    }

    /**
     * Penalty for the complainer of a dismissed complaint (proposal section 5.3). Only a confident
     * bad-faith verdict counts: the first one is a temporary ban, a repeat or an organized campaign a
     * permanent ban. An honest mistake (no bad-faith flag) is never penalized.
     */
    public PenaltyAction decideComplainerPenalty(AuraVerdict verdict, long priorBadFaithReports) {
        if (verdict.verdict() != ComplaintStatus.DISMISSED || !verdict.badFaithReport()
                || verdict.confidenceScore().compareTo(properties.getReview().getBadFaithMinConfidence()) < 0) {
            return PenaltyAction.NONE;
        }
        return priorBadFaithReports > 0 || verdict.coordinatedAttackSuspected()
                ? PenaltyAction.PERM_BAN
                : PenaltyAction.TEMP_BAN_7_DAYS;
    }

    /** Warnings that still count: they reset after {@code strike-decay} without a new penalty. */
    public int effectiveWarnings(User user, LocalDateTime now) {
        int count = user.getWarningCount() == null ? 0 : user.getWarningCount();
        LocalDateTime last = user.getLastPenalizedAt();
        if (count > 0 && last != null && last.plus(properties.getReview().getStrikeDecay()).isBefore(now)) {
            return 0;
        }
        return count;
    }
}

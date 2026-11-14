package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.ViolationCategory;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class SanctionPolicyTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 13, 12, 0);

    private final SanctionPolicy policy = new SanctionPolicy(new ComplaintModerationProperties());

    private static AuraVerdict resolved(PenaltyAction penalty, String confidence) {
        return new AuraVerdict(ComplaintStatus.RESOLVED, ViolationCategory.HARASSMENT, new BigDecimal(confidence),
                Severity.HIGH, penalty, "notes", "why", false, false);
    }

    private SanctionDecision decide(AuraVerdict verdict, int warnings, long tempBans, boolean listing) {
        return policy.decide(verdict, warnings, tempBans, listing);
    }

    @Test
    void dismissedComplaintHasNoPenalty() {
        AuraVerdict verdict = new AuraVerdict(ComplaintStatus.DISMISSED, ViolationCategory.NONE,
                new BigDecimal("0.95"), Severity.LOW, PenaltyAction.NONE, "notes", null, false, false);
        SanctionDecision d = decide(verdict, 5, 5, true);
        assertThat(d.status()).isEqualTo(ComplaintStatus.DISMISSED);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.NONE);
    }

    @Test
    void confidentVerdictIsAppliedAsRequested() {
        SanctionDecision d = decide(resolved(PenaltyAction.TEMP_BAN_7_DAYS, "0.90"), 0, 0, false);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
        assertThat(d.adjustment()).isNull();
    }

    @Test
    void lowConfidenceNeverBansEvenWhenAuraAsksForPermBan() {
        SanctionDecision d = decide(resolved(PenaltyAction.PERM_BAN, "0.65"), 0, 0, false);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.WARNING);
    }

    @Test
    void lowConfidenceAlsoCapsListingSuspension() {
        SanctionDecision d = decide(resolved(PenaltyAction.LISTING_SUSPENDED, "0.50"), 0, 0, true);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.WARNING);
    }

    @Test
    void lowConfidenceBlocksWarningEscalation() {
        SanctionDecision d = decide(resolved(PenaltyAction.WARNING, "0.40"), 3, 0, false);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.WARNING);
    }

    @Test
    void thresholdConfidenceIsNotLow() {
        SanctionDecision d = decide(resolved(PenaltyAction.TEMP_BAN_7_DAYS, "0.66"), 0, 0, false);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
    }

    @Test
    void thirdActiveWarningTurnsTheNextViolationIntoTempBan() {
        assertThat(decide(resolved(PenaltyAction.WARNING, "0.90"), 2, 0, false).penalty())
                .isEqualTo(PenaltyAction.WARNING);
        assertThat(decide(resolved(PenaltyAction.WARNING, "0.90"), 3, 0, false).penalty())
                .isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
    }

    @Test
    void fourthTempBanBecomesPermBan() {
        assertThat(decide(resolved(PenaltyAction.TEMP_BAN_7_DAYS, "0.90"), 0, 2, false).penalty())
                .isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
        assertThat(decide(resolved(PenaltyAction.TEMP_BAN_7_DAYS, "0.90"), 0, 3, false).penalty())
                .isEqualTo(PenaltyAction.PERM_BAN);
    }

    @Test
    void listingSuspensionWithoutListingFallsBackToWarning() {
        SanctionDecision d = decide(resolved(PenaltyAction.LISTING_SUSPENDED, "0.90"), 0, 0, false);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.WARNING);
        assertThat(d.adjustment()).contains("no listing");
    }

    @Test
    void violationWithoutPenaltyIsRecordedAsWarning() {
        SanctionDecision d = decide(resolved(PenaltyAction.NONE, "0.90"), 0, 0, false);
        assertThat(d.status()).isEqualTo(ComplaintStatus.RESOLVED);
        assertThat(d.penalty()).isEqualTo(PenaltyAction.WARNING);
    }

    private static User userWith(int warnings, LocalDateTime lastPenalized) {
        User user = new User();
        user.setWarningCount(warnings);
        user.setLastPenalizedAt(lastPenalized);
        return user;
    }

    @Test
    void warningsResetAfter180DaysWithoutPenalty() {
        assertThat(policy.effectiveWarnings(userWith(3, NOW.minusDays(181)), NOW)).isZero();
    }

    @Test
    void warningsWithinDecayWindowStillCount() {
        assertThat(policy.effectiveWarnings(userWith(3, NOW.minusDays(179)), NOW)).isEqualTo(3);
    }

    private static AuraVerdict badFaith(String confidence, boolean coordinated) {
        return new AuraVerdict(ComplaintStatus.DISMISSED, ViolationCategory.NONE, new BigDecimal(confidence),
                Severity.LOW, PenaltyAction.NONE, "notes", null, true, coordinated);
    }

    @Test
    void honestMistakeLeavesTheComplainerAlone() {
        AuraVerdict verdict = new AuraVerdict(ComplaintStatus.DISMISSED, ViolationCategory.NONE,
                new BigDecimal("0.99"), Severity.LOW, PenaltyAction.NONE, "notes", null, false, false);
        assertThat(policy.decideComplainerPenalty(verdict, 3)).isEqualTo(PenaltyAction.NONE);
    }

    @Test
    void firstBadFaithReportIsATemporaryBan() {
        assertThat(policy.decideComplainerPenalty(badFaith("0.90", false), 0)).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
    }

    @Test
    void repeatedBadFaithReportIsAPermanentBan() {
        assertThat(policy.decideComplainerPenalty(badFaith("0.90", false), 1)).isEqualTo(PenaltyAction.PERM_BAN);
    }

    @Test
    void coordinatedCampaignIsAPermanentBanOnFirstOffense() {
        assertThat(policy.decideComplainerPenalty(badFaith("0.90", true), 0)).isEqualTo(PenaltyAction.PERM_BAN);
    }

    @Test
    void doubtfulBadFaithVerdictIsNotPenalized() {
        assertThat(policy.decideComplainerPenalty(badFaith("0.84", true), 5)).isEqualTo(PenaltyAction.NONE);
    }

    @Test
    void upheldComplaintNeverPenalizesTheComplainer() {
        assertThat(policy.decideComplainerPenalty(resolved(PenaltyAction.WARNING, "0.99"), 5)).isEqualTo(PenaltyAction.NONE);
    }
}

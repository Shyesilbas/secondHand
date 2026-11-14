package com.serhat.secondhand.complaint.review;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.review.AuraVerdictParser.InvalidAuraVerdictException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuraVerdictParserTest {

    private final AuraVerdictParser parser = new AuraVerdictParser(new ObjectMapper());

    private static String json(String verdict, String category, String confidence, String penalty, String notes) {
        return """
                {"verdict":"%s","violationCategory":"%s","confidenceScore":%s,"severity":"HIGH",
                 "penaltyAction":"%s","adminNotes":%s,"actionExplanation":"msg 12",
                 "badFaithReport":false,"coordinatedAttackSuspected":false}
                """.formatted(verdict, category, confidence, penalty, notes);
    }

    @Test
    void parsesAValidVerdict() {
        AuraVerdict v = parser.parse(json("RESOLVED", "HARASSMENT", "0.876", "TEMP_BAN_7_DAYS", "\"Hakaret tespit edildi.\""));
        assertThat(v.verdict()).isEqualTo(ComplaintStatus.RESOLVED);
        assertThat(v.penaltyAction()).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
        assertThat(v.confidenceScore()).isEqualByComparingTo(new BigDecimal("0.88"));
    }

    @Test
    void dismissedWithPenaltyIsRejected() {
        assertThatThrownBy(() -> parser.parse(json("DISMISSED", "NONE", "0.9", "WARNING", "\"x\"")))
                .isInstanceOf(InvalidAuraVerdictException.class);
    }

    @Test
    void resolvedWithoutCategoryIsRejected() {
        assertThatThrownBy(() -> parser.parse(json("RESOLVED", "NONE", "0.9", "WARNING", "\"x\"")))
                .isInstanceOf(InvalidAuraVerdictException.class);
    }

    @Test
    void confidenceOutsideZeroToOneIsRejected() {
        assertThatThrownBy(() -> parser.parse(json("RESOLVED", "HARASSMENT", "1.5", "WARNING", "\"x\"")))
                .isInstanceOf(InvalidAuraVerdictException.class);
    }

    @Test
    void unknownPenaltyIsRejected() {
        assertThatThrownBy(() -> parser.parse(json("RESOLVED", "HARASSMENT", "0.9", "DELETE_ACCOUNT", "\"x\"")))
                .isInstanceOf(InvalidAuraVerdictException.class);
    }

    @Test
    void statusOtherThanAFinalVerdictIsRejected() {
        assertThatThrownBy(() -> parser.parse(json("PENDING", "NONE", "0.9", "NONE", "\"x\"")))
                .isInstanceOf(InvalidAuraVerdictException.class);
    }

    @Test
    void missingNotesAreRejected() {
        assertThatThrownBy(() -> parser.parse(json("DISMISSED", "NONE", "0.9", "NONE", "\" \"")))
                .isInstanceOf(InvalidAuraVerdictException.class);
    }

    @Test
    void nonJsonIsRejected() {
        assertThatThrownBy(() -> parser.parse("Cevap hazir"))
                .isInstanceOf(InvalidAuraVerdictException.class);
    }

    @Test
    void longNotesAreTruncatedToTheColumnSize() {
        String notes = "\"" + "a".repeat(1500) + "\"";
        assertThat(parser.parse(json("DISMISSED", "NONE", "0.9", "NONE", notes)).adminNotes()).hasSize(1000);
    }

    private static String withFlags(String verdict, String penalty, boolean badFaith, boolean coordinated) {
        String category = verdict.equals("RESOLVED") ? "HARASSMENT" : "NONE";
        return """
                {"verdict":"%s","violationCategory":"%s","confidenceScore":0.9,"severity":"LOW",
                 "penaltyAction":"%s","adminNotes":"n","badFaithReport":%s,"coordinatedAttackSuspected":%s}
                """.formatted(verdict, category, penalty, badFaith, coordinated);
    }

    @Test
    void badFaithFlagsAreParsed() {
        AuraVerdict v = parser.parse(withFlags("DISMISSED", "NONE", true, true));
        assertThat(v.badFaithReport()).isTrue();
        assertThat(v.coordinatedAttackSuspected()).isTrue();
    }

    @Test
    void missingBadFaithFlagIsRejected() {
        assertThatThrownBy(() -> parser.parse("""
                {"verdict":"DISMISSED","violationCategory":"NONE","confidenceScore":0.9,"severity":"LOW",
                 "penaltyAction":"NONE","adminNotes":"n","coordinatedAttackSuspected":false}"""))
                .isInstanceOf(AuraVerdictParser.InvalidAuraVerdictException.class);
    }

    @Test
    void upheldComplaintCannotBeBadFaith() {
        assertThatThrownBy(() -> parser.parse(withFlags("RESOLVED", "WARNING", true, false)))
                .isInstanceOf(AuraVerdictParser.InvalidAuraVerdictException.class);
    }

    @Test
    void coordinatedAttackNeedsBadFaith() {
        assertThatThrownBy(() -> parser.parse(withFlags("DISMISSED", "NONE", false, true)))
                .isInstanceOf(AuraVerdictParser.InvalidAuraVerdictException.class);
    }

    @Test
    void systemOnlyCategoryIsRejected() {
        assertThatThrownBy(() -> parser.parse("""
                {"verdict":"RESOLVED","violationCategory":"MALICIOUS_REPORT","confidenceScore":0.9,"severity":"LOW",
                 "penaltyAction":"WARNING","adminNotes":"n","badFaithReport":false,"coordinatedAttackSuspected":false}"""))
                .isInstanceOf(AuraVerdictParser.InvalidAuraVerdictException.class);
    }

    @Test
    void schemaDoesNotOfferTheSystemOnlyCategory() {
        assertThat(AuraVerdictParser.responseSchema().toString()).doesNotContain("MALICIOUS_REPORT");
    }
}

package com.serhat.secondhand.complaint.review;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.ViolationCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Gemini response schema (proposal section 4.2) and the strict parser for it. Anything malformed or
 * self-contradictory throws {@link InvalidAuraVerdictException}; the complaint is then retried, never
 * decided on a guess.
 */
@Component
@RequiredArgsConstructor
public class AuraVerdictParser {

    static final int MAX_NOTES_LENGTH = 1000;

    private final ObjectMapper objectMapper;

    public static Map<String, Object> responseSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("verdict", enumOf("RESOLVED", "DISMISSED"));
        properties.put("violationCategory", enumOf(auraCategories()));
        properties.put("confidenceScore", Map.of("type", "NUMBER"));
        properties.put("severity", enumOf(names(Severity.values())));
        properties.put("penaltyAction", enumOf(names(PenaltyAction.values())));
        properties.put("adminNotes", Map.of("type", "STRING"));
        properties.put("actionExplanation", Map.of("type", "STRING"));
        properties.put("badFaithReport", Map.of("type", "BOOLEAN"));
        properties.put("coordinatedAttackSuspected", Map.of("type", "BOOLEAN"));
        return Map.of(
                "type", "OBJECT",
                "properties", properties,
                "required", List.of("verdict", "violationCategory", "confidenceScore", "severity",
                        "penaltyAction", "adminNotes", "badFaithReport", "coordinatedAttackSuspected"));
    }

    public AuraVerdict parse(String raw) {
        JsonNode node;
        try {
            node = objectMapper.readTree(raw);
        } catch (Exception e) {
            throw new InvalidAuraVerdictException("Aura answer is not JSON");
        }
        if (node == null || !node.isObject()) {
            throw new InvalidAuraVerdictException("Aura answer is not a JSON object");
        }
        ComplaintStatus verdict = enumValue(node, "verdict", ComplaintStatus.class);
        if (verdict != ComplaintStatus.RESOLVED && verdict != ComplaintStatus.DISMISSED) {
            throw new InvalidAuraVerdictException("verdict must be RESOLVED or DISMISSED");
        }
        ViolationCategory category = enumValue(node, "violationCategory", ViolationCategory.class);
        if (category == ViolationCategory.MALICIOUS_REPORT) {
            throw new InvalidAuraVerdictException("MALICIOUS_REPORT is set by the system, not by Aura");
        }
        Severity severity = enumValue(node, "severity", Severity.class);
        PenaltyAction penalty = enumValue(node, "penaltyAction", PenaltyAction.class);

        JsonNode scoreNode = node.get("confidenceScore");
        if (scoreNode == null || !scoreNode.isNumber()) {
            throw new InvalidAuraVerdictException("confidenceScore must be a number");
        }
        BigDecimal confidence = scoreNode.decimalValue();
        if (confidence.compareTo(BigDecimal.ZERO) < 0 || confidence.compareTo(BigDecimal.ONE) > 0) {
            throw new InvalidAuraVerdictException("confidenceScore must be between 0 and 1");
        }

        String adminNotes = text(node, "adminNotes");
        if (adminNotes == null || adminNotes.isBlank()) {
            throw new InvalidAuraVerdictException("adminNotes is required");
        }

        if (verdict == ComplaintStatus.DISMISSED && penalty != PenaltyAction.NONE) {
            throw new InvalidAuraVerdictException("a dismissed complaint cannot carry a penalty");
        }
        if (verdict == ComplaintStatus.RESOLVED && category == ViolationCategory.NONE) {
            throw new InvalidAuraVerdictException("a resolved complaint needs a violation category");
        }
        boolean badFaith = bool(node, "badFaithReport");
        boolean coordinated = bool(node, "coordinatedAttackSuspected");
        if (badFaith && verdict != ComplaintStatus.DISMISSED) {
            throw new InvalidAuraVerdictException("only a dismissed complaint can be a bad-faith report");
        }
        if (coordinated && !badFaith) {
            throw new InvalidAuraVerdictException("a coordinated attack must also be a bad-faith report");
        }

        return new AuraVerdict(verdict, category, confidence.setScale(2, RoundingMode.HALF_UP), severity, penalty,
                truncate(adminNotes.trim()), truncate(text(node, "actionExplanation")), badFaith, coordinated);
    }

    private static <E extends Enum<E>> E enumValue(JsonNode node, String field, Class<E> type) {
        String value = text(node, field);
        if (value == null) {
            throw new InvalidAuraVerdictException(field + " is required");
        }
        try {
            return Enum.valueOf(type, value);
        } catch (IllegalArgumentException e) {
            throw new InvalidAuraVerdictException(field + " has unknown value " + value);
        }
    }

    private static boolean bool(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || !value.isBoolean()) {
            throw new InvalidAuraVerdictException(field + " must be a boolean");
        }
        return value.booleanValue();
    }

    private static String[] auraCategories() {
        return java.util.Arrays.stream(ViolationCategory.values())
                .filter(c -> c != ViolationCategory.MALICIOUS_REPORT)
                .map(Enum::name)
                .toArray(String[]::new);
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_NOTES_LENGTH ? value : value.substring(0, MAX_NOTES_LENGTH);
    }

    private static Map<String, Object> enumOf(String... values) {
        return Map.of("type", "STRING", "enum", List.of(values));
    }

    private static String[] names(Enum<?>[] values) {
        String[] names = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            names[i] = values[i].name();
        }
        return names;
    }

    public static class InvalidAuraVerdictException extends RuntimeException {
        public InvalidAuraVerdictException(String message) {
            super(message);
        }
    }
}

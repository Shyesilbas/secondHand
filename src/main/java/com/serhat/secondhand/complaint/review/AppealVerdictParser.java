package com.serhat.secondhand.complaint.review;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.complaint.AppealStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Response schema and strict parser for Aura's appeal decision; malformed answers throw and are retried. */
@Component
@RequiredArgsConstructor
public class AppealVerdictParser {

    static final int MAX_TEXT_LENGTH = 1000;

    private final ObjectMapper objectMapper;

    public static Map<String, Object> responseSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("decision", Map.of("type", "STRING", "enum", List.of("APPROVED", "REJECTED")));
        properties.put("confidenceScore", Map.of("type", "NUMBER"));
        properties.put("explanation", Map.of("type", "STRING"));
        properties.put("internalNotes", Map.of("type", "STRING"));
        return Map.of(
                "type", "OBJECT",
                "properties", properties,
                "required", List.of("decision", "confidenceScore", "explanation"));
    }

    public AppealVerdict parse(String raw) {
        JsonNode node;
        try {
            node = objectMapper.readTree(raw);
        } catch (Exception e) {
            throw new AuraVerdictParser.InvalidAuraVerdictException("Aura appeal answer is not JSON");
        }
        if (node == null || !node.isObject()) {
            throw new AuraVerdictParser.InvalidAuraVerdictException("Aura appeal answer is not a JSON object");
        }
        String decisionText = text(node, "decision");
        AppealStatus decision;
        if ("APPROVED".equals(decisionText)) {
            decision = AppealStatus.APPROVED;
        } else if ("REJECTED".equals(decisionText)) {
            decision = AppealStatus.REJECTED;
        } else {
            throw new AuraVerdictParser.InvalidAuraVerdictException("decision must be APPROVED or REJECTED");
        }
        JsonNode scoreNode = node.get("confidenceScore");
        if (scoreNode == null || !scoreNode.isNumber()) {
            throw new AuraVerdictParser.InvalidAuraVerdictException("confidenceScore must be a number");
        }
        BigDecimal confidence = scoreNode.decimalValue();
        if (confidence.compareTo(BigDecimal.ZERO) < 0 || confidence.compareTo(BigDecimal.ONE) > 0) {
            throw new AuraVerdictParser.InvalidAuraVerdictException("confidenceScore must be between 0 and 1");
        }
        String explanation = text(node, "explanation");
        if (explanation == null || explanation.isBlank()) {
            throw new AuraVerdictParser.InvalidAuraVerdictException("explanation is required");
        }
        return new AppealVerdict(decision, confidence.setScale(2, RoundingMode.HALF_UP),
                truncate(explanation.trim()), truncate(text(node, "internalNotes")));
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_TEXT_LENGTH ? value : value.substring(0, MAX_TEXT_LENGTH);
    }
}

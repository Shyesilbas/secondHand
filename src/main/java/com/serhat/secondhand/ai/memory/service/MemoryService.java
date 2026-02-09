package com.serhat.secondhand.ai.memory.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.serhat.secondhand.ai.dto.UserMemory;
import com.serhat.secondhand.ai.memory.ChatMessage;
import com.serhat.secondhand.ai.memory.ChatRole;
import com.serhat.secondhand.ai.memory.dto.MemoryExtraction;
import com.serhat.secondhand.ai.memory.repository.ChatMessageRepository;
import com.serhat.secondhand.ai.memory.repository.UserMemoryRepository;
import com.serhat.secondhand.ai.service.GeminiClient;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class MemoryService {

    private static final String DEFAULT_TONE = "Friendly";
    private static final int SUMMARY_MAX_CHARS = 8000;
    private static final int MEMORY_UPDATE_EVERY_N_USER_MESSAGES = 3;
    private static final int MIN_MESSAGE_LENGTH_FOR_MEMORY_UPDATE = 10;
    private static final Pattern MEMORY_TRIGGER_KEYWORDS = Pattern.compile("\\b(adım|bütçem|arıyorum|satıyorum|konumum|telefonum)\\b", Pattern.CASE_INSENSITIVE);

    private static final Pattern NAME_TR_PATTERN = Pattern.compile("\\b(?:adım|benim adım)\\s+([\\p{L}][\\p{L} '-]{1,60})\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern NAME_EN_PATTERN = Pattern.compile("\\b(?:my name is|i am|i'm)\\s+([\\p{L}][\\p{L} '-]{1,60})\\b", Pattern.CASE_INSENSITIVE);

    private static final Pattern TONE_TR_PATTERN = Pattern.compile("\\b(?:resmi|samimi|dostça|ciddi)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern TONE_EN_PATTERN = Pattern.compile("\\b(?:formal|friendly|casual|serious)\\b", Pattern.CASE_INSENSITIVE);

    private static final Pattern INTERESTS_TR_PATTERN = Pattern.compile("\\b(?:ilgi alanlarım|ilgilerim|hobilerim|hobi|seviyorum)\\s*[:\\-]?\\s*([^\\.\\n]{3,200})", Pattern.CASE_INSENSITIVE);
    private static final Pattern INTERESTS_EN_PATTERN = Pattern.compile("\\b(?:i like|my interests are|i'm interested in|my hobbies are)\\s*[:\\-]?\\s*([^\\.\\n]{3,200})", Pattern.CASE_INSENSITIVE);

    private final UserMemoryRepository userMemoryRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public MemoryService(
            UserMemoryRepository userMemoryRepository,
            ChatMessageRepository chatMessageRepository,
            GeminiClient geminiClient,
            ObjectMapper objectMapper
    ) {
        this.userMemoryRepository = userMemoryRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public UserMemory getOrCreate(Long userId) {
        return userMemoryRepository.findById(userId).orElseGet(() -> userMemoryRepository.save(new UserMemory(userId, DEFAULT_TONE)));
    }

    @Transactional
    public void storeMessage(Long userId, ChatRole role, String message) {
        chatMessageRepository.save(new ChatMessage(userId, role, normalize(message), Instant.now()));
    }

    @Async("taskExecutor")
    public void updateMemoryFromInteraction(Long userId, String userMessage, String assistantAnswer) {
        try {
            updateMemoryFromInteractionInternal(userId, userMessage, assistantAnswer);
        } catch (Exception e) {
            log.error("Failed to update memory for user {}: {}", userId, e.getMessage(), e);
            return;
        }
    }

    public boolean shouldUpdateMemory(Long userId, String userMessage) {
        if (userId == null) {
            return false;
        }
        long userMessageCount = chatMessageRepository.countByUserIdAndRole(userId, ChatRole.USER);
        if (userMessageCount > 0 && userMessageCount % MEMORY_UPDATE_EVERY_N_USER_MESSAGES == 0) {
            return true;
        }
        String normalized = normalize(userMessage);
        if (normalized == null || normalized.length() < MIN_MESSAGE_LENGTH_FOR_MEMORY_UPDATE) {
            return false;
        }
        return MEMORY_TRIGGER_KEYWORDS.matcher(normalized).find();
    }

    @Transactional
    public void refreshSummary(Long userId) {
        UserMemory memory = getOrCreate(userId);
        List<ChatMessage> recent = new ArrayList<>(chatMessageRepository.findTop30ByUserIdOrderByTimestampDesc(userId));
        recent.sort(Comparator.comparing(ChatMessage::getTimestamp));
        StringBuilder sb = new StringBuilder();
        for (ChatMessage msg : recent) {
            sb.append(msg.getRole().name()).append(": ").append(compact(msg.getMessage())).append("\n");
        }
        String summary = trimToMax(sb.toString().trim(), SUMMARY_MAX_CHARS);
        memory.setSummaryOfPastConversations(summary);
        userMemoryRepository.save(memory);
    }

    @Transactional
    public void clearConversationHistory(Long userId) {
        chatMessageRepository.deleteByUserId(userId);
        userMemoryRepository.findById(userId).ifPresent(memory -> {
            memory.setSummaryOfPastConversations(null);
            userMemoryRepository.save(memory);
        });
    }

    @Transactional
    public void deleteMemory(Long userId) {
        chatMessageRepository.deleteByUserId(userId);
        userMemoryRepository.deleteById(userId);
    }

    public String buildMemoryData(UserMemory memory) {
        String name = Optional.ofNullable(memory.getUserName()).orElse("Unknown");
        String tone = Optional.ofNullable(memory.getPreferredTone()).orElse(DEFAULT_TONE);
        String interests = memory.getPermanentInterests() == null || memory.getPermanentInterests().isEmpty()
                ? "[]"
                : memory.getPermanentInterests().toString();
        String summary = Optional.ofNullable(memory.getSummaryOfPastConversations()).orElse("");
        String notes = Optional.ofNullable(memory.getUserNotes()).orElse("");
        String secondHandProfileJson = Optional.ofNullable(memory.getSecondHandProfileJson()).orElse("{}");

        return """
                userId=%s
                userName=%s
                preferredTone=%s
                permanentInterests=%s
                summaryOfPastConversations=%s
                notes=%s
                secondHandProfileJson=%s
                """.formatted(memory.getUserId(), name, tone, interests, summary, notes, secondHandProfileJson);
    }

    public boolean isIntroductionMode(UserMemory memory) {
        return (memory.getUserName() == null || memory.getUserName().isBlank())
                && (memory.getSummaryOfPastConversations() == null || memory.getSummaryOfPastConversations().isBlank());
    }

    private MemoryExtraction extractMemoryWithAi(UserMemory memory, String userMessage, String assistantAnswer) {
        String prompt = """
                Task: Extract new user profile facts for a multi-category second-hand marketplace assistant.
                Return only a single JSON object with keys: name, tone, interests, notes, secondHandProfile.
                Rules:
                - Output must be valid JSON, no markdown, no code fences, no extra text.
                - Use null when unknown.
                - "tone" should be one of: Friendly, Formal, Casual, Serious, or null.
                - "interests" must be an array of strings or [].
                - "notes" can include goals, needs, constraints, preferences.
                - "secondHandProfile" must be a JSON object with keys: categories, budget, brands.
                - "categories" is an array of strings from: Electronics, Books, Clothing, RealEstate, Sports, Automobile, or [].
                - "budget" is a JSON object: {"min": number|null, "max": number|null, "currency": "TRY"|"USD"|"EUR"|null} or null.
                - "brands" is an array of strings or [].
                - If the user expresses category interest (e.g. "araba", "otomobil", "araç"), include "Automobile" in secondHandProfile.categories and also add a matching item into interests.

                CURRENT_MEMORY:
                %s

                LAST_INTERACTION:
                user=%s
                assistant=%s
                """.formatted(
                buildMemoryData(memory),
                compact(userMessage),
                compact(assistantAnswer)
        );

        try {
            String raw = geminiClient.generateTextForMemory(prompt);
            return parseExtraction(raw);
        } catch (Exception e) {
            log.error("Failed to extract memory with AI for user {}: {}", memory.getUserId(), e.getMessage(), e);
            return new MemoryExtraction(null, null, List.of(), null, null);
        }
    }

    @Transactional
    void updateMemoryFromInteractionInternal(Long userId, String userMessage, String assistantAnswer) {
        UserMemory memory = getOrCreate(userId);
        MemoryExtraction extraction = extractMemoryWithAi(memory, userMessage, assistantAnswer);
        applyAiExtraction(memory, extraction);
        applyFallbackHeuristics(memory, extraction, userMessage);
        userMemoryRepository.save(memory);
        refreshSummary(userId);
    }

    private MemoryExtraction parseExtraction(String raw) {
        String json = extractJsonObject(raw);
        if (json == null) {
            return new MemoryExtraction(null, null, List.of(), null, null);
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            String name = normalize(textOrNull(node.get("name")));
            String tone = normalize(textOrNull(node.get("tone")));
            List<String> interests = readInterests(node.get("interests"));
            String notes = normalize(textOrNull(node.get("notes")));
            String secondHandProfileJson = readSecondHandProfileJson(node.get("secondHandProfile"));
            return new MemoryExtraction(name, tone, interests, notes, secondHandProfileJson);
        } catch (Exception e) {
            log.warn("Failed to parse memory extraction JSON, attempting fallback: {}", e.getMessage());
            try {
                return objectMapper.readValue(json, MemoryExtraction.class);
            } catch (Exception fallbackException) {
                log.error("Failed to parse memory extraction with fallback: {}", fallbackException.getMessage(), fallbackException);
                return new MemoryExtraction(null, null, List.of(), null, null);
            }
        }
    }

    private String readSecondHandProfileJson(JsonNode profileNode) {
        if (profileNode == null || profileNode.isNull()) {
            return null;
        }
        if (profileNode.isObject()) {
            return profileNode.toString();
        }
        String asText = normalize(profileNode.asText(null));
        if (asText == null) {
            return null;
        }
        String json = extractJsonObject(asText);
        return json == null ? null : json;
    }

    private List<String> readInterests(JsonNode interestsNode) {
        if (interestsNode == null || interestsNode.isNull()) {
            return List.of();
        }
        if (interestsNode.isArray()) {
            List<String> out = new ArrayList<>();
            for (JsonNode item : interestsNode) {
                String v = normalize(item.asText(null));
                if (v != null && v.length() <= 200) {
                    out.add(v);
                }
            }
            return out;
        }
        String asText = normalize(interestsNode.asText(null));
        if (asText == null) {
            return List.of();
        }
        return splitInterests(asText);
    }

    private String textOrNull(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            return node.asText();
        }
        return node.toString();
    }

    private String extractJsonObject(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) {
            return null;
        }
        return trimmed.substring(start, end + 1).trim();
    }

    private void applyAiExtraction(UserMemory memory, MemoryExtraction extraction) {
        if (extraction == null) {
            return;
        }

        String name = normalize(extraction.name());
        if (name != null && (memory.getUserName() == null || memory.getUserName().isBlank())) {
            memory.setUserName(normalizeName(name));
        }

        String tone = normalize(extraction.tone());
        if (tone != null) {
            memory.setPreferredTone(normalizeTone(tone));
        }

        if (extraction.interests() != null) {
            for (String interest : extraction.interests()) {
                memory.addPermanentInterest(interest);
            }
        }

        String notes = normalize(extraction.notes());
        if (notes != null) {
            memory.setUserNotes(mergeNotes(memory.getUserNotes(), notes));
        }

        String profileJson = normalize(extraction.secondHandProfileJson());
        if (profileJson != null) {
            memory.setSecondHandProfileJson(mergeSecondHandProfile(memory.getSecondHandProfileJson(), profileJson));
        }

        syncInterestsFromSecondHandProfile(memory);
    }

    private void applyFallbackHeuristics(UserMemory memory, MemoryExtraction extraction, String userMessage) {
        boolean missingName = extraction == null || normalize(extraction.name()) == null;
        boolean missingTone = extraction == null || normalize(extraction.tone()) == null;
        boolean missingInterests = extraction == null || extraction.interests() == null || extraction.interests().isEmpty();

        if (missingName) {
            applyNameHeuristics(memory, userMessage);
        }
        if (missingTone) {
            applyToneHeuristics(memory, userMessage);
        }
        if (missingInterests) {
            applyInterestHeuristics(memory, userMessage);
        }
    }

    private String mergeNotes(String existing, String incoming) {
        String e = normalize(existing);
        String i = normalize(incoming);
        if (i == null) {
            return e;
        }
        if (e == null) {
            return i;
        }
        if (e.equalsIgnoreCase(i)) {
            return e;
        }
        if (e.toLowerCase(Locale.ROOT).contains(i.toLowerCase(Locale.ROOT))) {
            return e;
        }
        String merged = e + "\n" + i;
        return trimToMax(merged, SUMMARY_MAX_CHARS);
    }

    private String mergeSecondHandProfile(String existingJson, String incomingJson) {
        ObjectNode base = parseObjectOrEmpty(existingJson);
        ObjectNode incoming = parseObjectOrEmpty(incomingJson);

        mergeStringArray(base, incoming, "categories");
        mergeStringArray(base, incoming, "brands");

        JsonNode incomingBudget = incoming.get("budget");
        if (incomingBudget != null && !incomingBudget.isNull()) {
            if (incomingBudget.isObject()) {
                base.set("budget", incomingBudget);
            } else {
                base.put("budget", incomingBudget.asText());
            }
        }

        try {
            return objectMapper.writeValueAsString(base);
        } catch (Exception e) {
            log.error("Failed to serialize merged profile JSON: {}", e.getMessage(), e);
            return base.toString();
        }
    }

    private void syncInterestsFromSecondHandProfile(UserMemory memory) {
        String json = normalize(memory.getSecondHandProfileJson());
        if (json == null) {
            return;
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            if (node == null || !node.isObject()) {
                return;
            }
            JsonNode categories = node.get("categories");
            if (categories != null && categories.isArray()) {
                for (JsonNode item : categories) {
                    String v = normalize(item.asText(null));
                    if (v != null) {
                        memory.addPermanentInterest(v);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync interests from profile JSON: {}", e.getMessage());
        }
    }

    private ObjectNode parseObjectOrEmpty(String json) {
        String normalized = normalize(json);
        if (normalized == null) {
            return objectMapper.createObjectNode();
        }
        try {
            JsonNode node = objectMapper.readTree(normalized);
            if (node != null && node.isObject()) {
                return (ObjectNode) node;
            }
        } catch (Exception ignored) {
        }
        return objectMapper.createObjectNode();
    }

    private void mergeStringArray(ObjectNode base, ObjectNode incoming, String field) {
        ArrayNode out = objectMapper.createArrayNode();
        addUniqueStrings(out, base.get(field));
        addUniqueStrings(out, incoming.get(field));
        if (out.isEmpty()) {
            base.remove(field);
            return;
        }
        base.set(field, out);
    }

    private void addUniqueStrings(ArrayNode out, JsonNode node) {
        if (node == null || node.isNull()) {
            return;
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                String v = normalize(item.asText(null));
                if (v != null && v.length() <= 60 && !containsIgnoreCase(out, v)) {
                    out.add(v);
                }
            }
            return;
        }
        String v = normalize(node.asText(null));
        if (v != null && v.length() <= 60 && !containsIgnoreCase(out, v)) {
            out.add(v);
        }
    }

    private boolean containsIgnoreCase(ArrayNode out, String value) {
        for (JsonNode item : out) {
            if (item != null && item.isTextual() && item.asText().equalsIgnoreCase(value)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeTone(String value) {
        String v = normalize(value);
        if (v == null) {
            return null;
        }
        String lowered = v.toLowerCase(Locale.ROOT);
        if (lowered.contains("formal") || lowered.contains("resmi")) {
            return "Formal";
        }
        if (lowered.contains("serious") || lowered.contains("ciddi")) {
            return "Serious";
        }
        if (lowered.contains("casual")) {
            return "Casual";
        }
        if (lowered.contains("friendly") || lowered.contains("samimi") || lowered.contains("dost")) {
            return "Friendly";
        }
        return v;
    }

    private void applyNameHeuristics(UserMemory memory, String userMessage) {
        if (memory.getUserName() != null) {
            return;
        }
        extractFirstGroup(NAME_TR_PATTERN, userMessage).or(() -> extractFirstGroup(NAME_EN_PATTERN, userMessage))
                .map(this::normalizeName)
                .ifPresent(memory::setUserName);
    }

    private void applyToneHeuristics(UserMemory memory, String userMessage) {
        String lowered = safeLower(userMessage);
        if (lowered == null) {
            return;
        }
        if (TONE_TR_PATTERN.matcher(lowered).find()) {
            if (lowered.contains("resmi") || lowered.contains("ciddi")) {
                memory.setPreferredTone("Formal");
            } else {
                memory.setPreferredTone("Friendly");
            }
            return;
        }
        if (TONE_EN_PATTERN.matcher(lowered).find()) {
            if (lowered.contains("formal") || lowered.contains("serious")) {
                memory.setPreferredTone("Formal");
            } else {
                memory.setPreferredTone("Friendly");
            }
        }
    }

    private void applyInterestHeuristics(UserMemory memory, String userMessage) {
        extractFirstGroup(INTERESTS_TR_PATTERN, userMessage).or(() -> extractFirstGroup(INTERESTS_EN_PATTERN, userMessage))
                .map(this::splitInterests)
                .ifPresent(interests -> interests.forEach(memory::addPermanentInterest));
    }

    private Optional<String> extractFirstGroup(Pattern pattern, String text) {
        if (text == null) {
            return Optional.empty();
        }
        Matcher m = pattern.matcher(text);
        if (!m.find()) {
            return Optional.empty();
        }
        return Optional.ofNullable(normalize(m.group(1)));
    }

    private List<String> splitInterests(String raw) {
        if (raw == null) {
            return List.of();
        }
        String cleaned = raw.replace("ve", ",").replace("&", ",");
        String[] parts = cleaned.split("[,;]");
        List<String> result = new ArrayList<>();
        for (String p : parts) {
            String normalized = normalize(p);
            if (normalized != null && normalized.length() <= 200) {
                result.add(normalized);
            }
        }
        return result;
    }

    private String normalizeName(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        String trimmed = normalized.replaceAll("\\s+", " ").trim();
        if (trimmed.length() > 60) {
            return trimmed.substring(0, 60).trim();
        }
        return trimmed;
    }

    private String safeLower(String value) {
        if (value == null) {
            return null;
        }
        return value.toLowerCase(Locale.ROOT);
    }

    private String compact(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return "";
        }
        return normalized.replaceAll("\\s+", " ").trim();
    }

    private String trimToMax(String value, int maxChars) {
        if (value == null) {
            return null;
        }
        if (value.length() <= maxChars) {
            return value;
        }
        return value.substring(value.length() - maxChars);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

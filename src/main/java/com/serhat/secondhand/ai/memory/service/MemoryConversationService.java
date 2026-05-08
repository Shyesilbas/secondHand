package com.serhat.secondhand.ai.memory.service;

import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.ai.dto.UserMemory;
import com.serhat.secondhand.ai.memory.ChatMessage;
import com.serhat.secondhand.ai.memory.repository.ChatMessageRepository;
import com.serhat.secondhand.ai.memory.repository.UserMemoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemoryConversationService {

    private static final int SUMMARY_MAX_CHARS = 8000;
    private static final int RECENT_PROMPT_MAX_CHARS = 4000;
    private static final int SUMMARY_LLM_INPUT_MAX_CHARS = 6000;
    private static final int SUMMARY_LLM_OUTPUT_TARGET_CHARS = 1200;
    private static final String MEMORY_RATE_LIMIT_PLACEHOLDER = "Cevap hazır";

    private final UserMemoryRepository userMemoryRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiClient geminiClient;

    @Transactional
    public void refreshSummary(Long userId, UserMemory memory) {
        List<ChatMessage> recent = new ArrayList<>(chatMessageRepository.findTop30ByUserIdOrderByTimestampDesc(userId));
        recent.sort(Comparator.comparing(ChatMessage::getTimestamp));
        StringBuilder sb = new StringBuilder();
        for (ChatMessage msg : recent) {
            sb.append(msg.getRole().name()).append(": ").append(compact(msg.getMessage())).append("\n");
        }
        String transcript = sb.toString().trim();
        if (transcript.isEmpty()) {
            memory.setSummaryOfPastConversations(null);
            userMemoryRepository.save(memory);
            return;
        }
        String transcriptForLlm = trimToMax(transcript, SUMMARY_LLM_INPUT_MAX_CHARS);
        String aiSummary = summarizeTranscriptWithLlm(transcriptForLlm);
        String summary = (aiSummary != null && !aiSummary.isBlank())
                ? trimToMax(aiSummary, SUMMARY_MAX_CHARS)
                : trimToMax(transcript, SUMMARY_MAX_CHARS);
        memory.setSummaryOfPastConversations(summary);
        userMemoryRepository.save(memory);
    }

    /** Son mesajları modele taşınacak kısa transkript olarak döner (henüz kaydedilmemiş tur hariç). */
    @Transactional(readOnly = true)
    public String buildRecentConversationBlock(Long userId) {
        if (userId == null) {
            return "";
        }
        List<ChatMessage> recent = new ArrayList<>(chatMessageRepository.findTop12ByUserIdOrderByTimestampDesc(userId));
        if (recent.isEmpty()) {
            return "";
        }
        recent.sort(Comparator.comparing(ChatMessage::getTimestamp));
        StringBuilder sb = new StringBuilder();
        for (ChatMessage msg : recent) {
            sb.append(msg.getRole().name()).append(": ").append(compact(msg.getMessage())).append("\n");
        }
        return trimToMax(sb.toString().trim(), RECENT_PROMPT_MAX_CHARS);
    }

    private String summarizeTranscriptWithLlm(String transcript) {
        String prompt = """
                Görev: Aşağıdaki Aura asistanı ile kullanıcı arasındaki mesajları Türkçe, tek paragraf veya madde işaretleriyle en fazla %d karakterde özetle.
                Odak: kullanıcı niyeti, tercihler, açık sorular, verilen tavsiyeler. Markdown veya kod bloğu kullanma.
                Sadece özeti yaz; giriş cümlesi ekleme.

                TRANSKRİPT:
                %s
                """.formatted(SUMMARY_LLM_OUTPUT_TARGET_CHARS, transcript);
        try {
            String raw = geminiClient.generateTextForMemory(prompt);
            if (raw == null || raw.isBlank() || MEMORY_RATE_LIMIT_PLACEHOLDER.equals(raw.trim())) {
                return null;
            }
            String cleaned = compact(raw);
            return cleaned.length() < 12 ? null : cleaned;
        } catch (Exception e) {
            log.warn("Konuşma LLM özeti başarısız: {}", e.getMessage());
            return null;
        }
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

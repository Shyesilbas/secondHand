package com.serhat.secondhand.ai.agent.prompt;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.config.AuraSystemInstructions;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.util.PromptSanitizer;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class AgentPromptBuilder {

    private static final int MAX_RECENT_CHARS = 4000;
    private static final int MAX_MEMORY_CHARS = 3000;
    private static final int MAX_DOMAIN_CHARS = 4000;
    private static final int MAX_LIVE_SEARCH_CHARS = 4000;
    private static final int MAX_UI_CONTEXT_CHARS = 1000;
    private static final int MAX_SESSION_CONTEXT_CHARS = 4000;
    private static final int MAX_QUESTION_CHARS = 2000;
    private static final int MAX_FILTER_ENTRIES = 20;
    private static final int MAX_FILTER_KEY_CHARS = 50;
    private static final int MAX_FILTER_VAL_CHARS = 120;

    public String buildPrompt(
            String memoryData,
            String domainContext,
            UserQuestionRequest request,
            AgentUiContextRequest uiContext,
            String recentConversation,
            String liveSearchResults
    ) {
        String sessionContext = request.context() == null ? "" : request.context().trim();
        String uiContextText = formatUiContext(uiContext);
        String recentBlock = (recentConversation == null || recentConversation.isBlank())
                ? "-"
                : recentConversation.trim();
        String liveBlock = (liveSearchResults == null || liveSearchResults.isBlank()) ? "-" : liveSearchResults.trim();

        return """
                %s

                SON KONUŞMA (kronolojik, önceki turlar):
                %s

                USER MEMORY:
                %s

                AGENT DOMAIN CONTEXT:
                %s

                CANLI İLAN ARAMA SONUÇLARI (yalnızca burada listelenen ilanlar gerçektir; uydurma):
                %s

                UI CONTEXT:
                %s

                SESSION CONTEXT (ek sayfa/ilan özeti):
                %s

                USER QUESTION:
                %s

                YANIT STİLİ:
                - Doğal, samimi, kaliteli ve kullanıcı bağlamına özel yaz.
                - Yanıtı düz metin olarak üret; markdown sembolleri (`*`, `**`, `#`, backtick) kullanma.
                - Robotik şablonlardan (Durum, Öneri, Sonraki adım başlıkları) veya 'Kaynak:' gibi teknik etiketlerden kaçın.
                - Cevaba doğrudan konuya girerek başla; gereksiz giriş/selamlama ifadeleriyle uzatma.
                """.formatted(
                AuraSystemInstructions.agentSystemPreambleWithPlatformKnowledge(),
                PromptSanitizer.wrapUntrustedEvidence("recent_conversation", recentBlock, MAX_RECENT_CHARS),
                PromptSanitizer.wrapUntrustedEvidence("user_memory", memoryData, MAX_MEMORY_CHARS),
                PromptSanitizer.wrapUntrustedEvidence("domain_context", domainContext, MAX_DOMAIN_CHARS),
                PromptSanitizer.wrapUntrustedEvidence("live_search", liveBlock, MAX_LIVE_SEARCH_CHARS),
                PromptSanitizer.wrapUntrustedEvidence("ui_context", uiContextText, MAX_UI_CONTEXT_CHARS),
                PromptSanitizer.wrapUntrustedEvidence("session_context", sessionContext, MAX_SESSION_CONTEXT_CHARS),
                PromptSanitizer.wrapUntrustedEvidence("user_question", request.question(), MAX_QUESTION_CHARS)
        );
    }

    private String formatUiContext(AgentUiContextRequest uiContext) {
        if (uiContext == null) {
            return "No uiContext provided.";
        }

        String filters = formatFilters(uiContext.filters());
        return """
                currentPage=%s
                route=%s
                listingId=%s
                filters=%s
                """.formatted(
                safe(PromptSanitizer.truncate(uiContext.currentPage(), 100)),
                safe(PromptSanitizer.truncate(uiContext.route(), 255)),
                safe(PromptSanitizer.truncate(uiContext.listingId(), 100)),
                filters
        );
    }

    private String formatFilters(Map<String, String> filters) {
        if (filters == null || filters.isEmpty()) {
            return "{}";
        }
        return filters.entrySet().stream()
                .limit(MAX_FILTER_ENTRIES)
                .map(entry -> PromptSanitizer.truncate(entry.getKey(), MAX_FILTER_KEY_CHARS)
                        + "="
                        + PromptSanitizer.truncate(entry.getValue(), MAX_FILTER_VAL_CHARS))
                .collect(Collectors.joining(", ", "{", "}"));
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}

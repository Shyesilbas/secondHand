package com.serhat.secondhand.ai.agent.prompt;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.config.AuraSystemInstructions;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class AgentPromptBuilder {

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
                - Kısa, uygulanabilir ve kullanıcı bağlamına özel yaz.
                - Yanıtı düz metin olarak üret; markdown sembolleri (`*`, `**`, `#`, backtick) kullanma.
                - Bu sıra ile ilerle: Durum, Öneri, Sonraki adım.
                - Adım gerekiyorsa `1)`, `2)`, `3)` numaralı kısa satırlar kullan.
                - Yararlıysa hangi kaynağın yanıtı beslediğini tek satırda belirt (siparişler, ilanlarım, bildirimler, aktif ilan, canlı arama, bellek, son konuşma).
                """.formatted(
                AuraSystemInstructions.agentSystemPreambleWithPlatformKnowledge(),
                safe(recentBlock),
                safe(memoryData),
                safe(domainContext),
                safe(liveBlock),
                safe(uiContextText),
                safe(sessionContext),
                safe(request.question())
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
                safe(uiContext.currentPage()),
                safe(uiContext.route()),
                safe(uiContext.listingId()),
                filters
        );
    }

    private String formatFilters(Map<String, String> filters) {
        if (filters == null || filters.isEmpty()) {
            return "{}";
        }
        return filters.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining(", ", "{", "}"));
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}

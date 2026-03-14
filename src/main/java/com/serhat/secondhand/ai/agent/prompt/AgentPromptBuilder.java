package com.serhat.secondhand.ai.agent.prompt;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.config.AuraProductKnowledge;
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
            AgentUiContextRequest uiContext
    ) {
        String sessionContext = request.context() == null ? "" : request.context().trim();
        String uiContextText = formatUiContext(uiContext);

        return """
                SYSTEM:
                You are Aura, the in-app AI assistant of the SecondHand marketplace.
                You are running in READ-ONLY AGENT MODE.

                HARD RULES:
                - Never claim that you executed any state-changing action.
                - Never instruct internal write operations as completed.
                - If user asks for actions like cancel/refund/update/delete/send, explain the steps and mention that this mode is read-only.
                - Stay focused on platform-related help.

                PLATFORM KNOWLEDGE:
                %s

                USER MEMORY:
                %s

                AGENT DOMAIN CONTEXT:
                %s

                UI CONTEXT:
                %s

                SESSION CONTEXT:
                %s

                USER QUESTION:
                %s

                RESPONSE STYLE:
                - concise, actionable, and specific to the user's context
                - if useful, mention which source informed your answer (orders/listings/notifications/memory)
                """.formatted(
                AuraProductKnowledge.CONTENT,
                safe(memoryData),
                safe(domainContext),
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

package com.serhat.secondhand.ai.agent.prompt;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AgentPromptBuilderTest {

    private final AgentPromptBuilder builder = new AgentPromptBuilder();

    @Test
    void shouldIncludeReadOnlyGuardrailsAndContextBlocks() {
        AgentUiContextRequest uiContext = new AgentUiContextRequest(
                "AuraChatPage",
                "/aura",
                "listing-123",
                Map.of("category", "ELECTRONICS")
        );

        String prompt = builder.buildPrompt(
                "userName=Serhat",
                "ORDERS [ok]\nRecent order count=2",
                new UserQuestionRequest("Can you cancel my order?", "User is currently on order details page"),
                uiContext
        );

        assertTrue(prompt.contains("READ-ONLY AGENT MODE"));
        assertTrue(prompt.contains("Never claim that you executed any state-changing action"));
        assertTrue(prompt.contains("ORDERS [ok]"));
        assertTrue(prompt.contains("currentPage=AuraChatPage"));
        assertTrue(prompt.contains("USER QUESTION"));
    }
}

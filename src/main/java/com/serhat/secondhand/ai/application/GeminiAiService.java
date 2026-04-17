package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.agent.prompt.AgentPromptBuilder;
import com.serhat.secondhand.ai.config.AuraSystemInstructions;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserMemory;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.memory.ChatRole;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GeminiAiService {

    private final MemoryService memoryService;
    private final GeminiClient geminiClient;
    private final AgentPromptBuilder agentPromptBuilder;

    public GeminiAiService(MemoryService memoryService, GeminiClient geminiClient, AgentPromptBuilder agentPromptBuilder) {
        this.memoryService = memoryService;
        this.geminiClient = geminiClient;
        this.agentPromptBuilder = agentPromptBuilder;
    }

    public String testConnection(String message) {
        log.info("Test connection with message: {}", message.substring(0, Math.min(50, message.length())));
        return geminiClient.generateText(message);
    }

    public AiResponse askQuestion(UserQuestionRequest request) {
        log.info("User question received: {} characters", request.question().length());

        try {
            String prompt = buildPrompt(request);
            String answer = geminiClient.generateText(prompt);
            return AiResponse.success(answer, geminiClient.model());
        } catch (Exception e) {
            log.error("Error while processing question: ", e);
            return AiResponse.error("Failed to get response: " + e.getMessage());
        }
    }

    public AiResponse askQuestion(Long userId, UserQuestionRequest request) {
        if (userId == null) {
            return AiResponse.error("userId is required");
        }
        if (request == null || request.question() == null || request.question().isBlank()) {
            return AiResponse.error("Question cannot be empty");
        }

        try {
            UserMemory memory = memoryService.getOrCreate(userId);
            String recent = memoryService.buildRecentConversationBlock(userId);
            String prompt = buildMemoryAwarePrompt(memory, request, recent);
            String answer = geminiClient.generateText(prompt);

            memoryService.storeMessage(userId, ChatRole.USER, request.question());
            memoryService.storeMessage(userId, ChatRole.ASSISTANT, answer);
            if (memoryService.shouldUpdateMemory(userId, request.question())) {
                memoryService.updateMemoryFromInteraction(userId, request.question(), answer);
            }

            return AiResponse.success(answer, geminiClient.model());
        } catch (Exception e) {
            log.error("Error while processing memory-aware question: ", e);
            return AiResponse.error("Failed to get response: " + e.getMessage());
        }
    }

    public AiResponse askAgentQuestion(
            Long userId,
            UserQuestionRequest request,
            String memoryData,
            String domainContext,
            AgentUiContextRequest uiContext,
            String liveSearchResults
    ) {
        if (userId == null) {
            return AiResponse.error("userId is required");
        }
        if (request == null || request.question() == null || request.question().isBlank()) {
            return AiResponse.error("Question cannot be empty");
        }

        try {
            String recent = memoryService.buildRecentConversationBlock(userId);
            String live = liveSearchResults == null ? "" : liveSearchResults;
            String prompt = agentPromptBuilder.buildPrompt(memoryData, domainContext, request, uiContext, recent, live);
            String answer = geminiClient.generateText(prompt);

            memoryService.storeMessage(userId, ChatRole.USER, request.question());
            memoryService.storeMessage(userId, ChatRole.ASSISTANT, answer);
            if (memoryService.shouldUpdateMemory(userId, request.question())) {
                memoryService.updateMemoryFromInteraction(userId, request.question(), answer);
            }

            return AiResponse.success(answer, geminiClient.model());
        } catch (Exception e) {
            log.error("Error while processing agent-mode question: ", e);
            return AiResponse.error("Failed to get response: " + e.getMessage());
        }
    }

    private String buildPrompt(UserQuestionRequest request) {
        if (request.context() != null && !request.context().isBlank()) {
            return String.format("""
                Context: %s
                
                Question: %s
                
                Please answer the question considering the context above.
                """, request.context(), request.question());
        }
        return request.question();
    }

    private String buildMemoryAwarePrompt(UserMemory memory, UserQuestionRequest request, String recentConversation) {
        String memoryData = memoryService.buildMemoryData(memory);
        boolean introductionMode = memoryService.isIntroductionMode(memory);

        String contextBlock = """
                USER MEMORY / CONTEXT:
                %s
                """.formatted(memoryData);

        String recentBlock = (recentConversation == null || recentConversation.isBlank())
                ? ""
                : """
                SON KONUŞMA (önceki turlar, kronolojik):
                %s

                """.formatted(recentConversation.trim());

        String sessionContextBlock = (request.context() != null && !request.context().isBlank())
                ? """
                CURRENT SESSION CONTEXT (kullanıcı şu an bu sayfada/ekranda; cevabını buna göre ver):
                %s

                """.formatted(request.context().trim())
                : "";

        String systemInstruction = AuraSystemInstructions.chatSystemWithPlatformKnowledge();

        String introInstruction = introductionMode ? """
                Kullanıcıyla ilk kez karşılaşıyorsun. Kısa kendini tanıt, neye yardımcı olabileceğini söyle; platform içi bir ihtiyaç varsa hemen yönlendir.

                """ : "";

        String questionBlock = request.question();

        return contextBlock + "\n" + recentBlock + sessionContextBlock + systemInstruction + "\n" + introInstruction + "USER:\n" + questionBlock;
    }

}
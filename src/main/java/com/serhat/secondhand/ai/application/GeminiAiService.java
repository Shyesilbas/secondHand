package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.agent.prompt.AgentPromptBuilder;
import com.serhat.secondhand.ai.config.AuraSystemInstructions;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserMemory;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.memory.ChatRole;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@Slf4j
public class GeminiAiService {

    private final MemoryService memoryService;
    private final GeminiClient geminiClient;
    private final AgentPromptBuilder agentPromptBuilder;
    private final UserRepository userRepository;
    private final TransactionTemplate transactionTemplate;

    public GeminiAiService(MemoryService memoryService, GeminiClient geminiClient, AgentPromptBuilder agentPromptBuilder, UserRepository userRepository, PlatformTransactionManager transactionManager) {
        this.memoryService = memoryService;
        this.geminiClient = geminiClient;
        this.agentPromptBuilder = agentPromptBuilder;
        this.userRepository = userRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
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
            return AiResponse.error(clientErrorMessage(e));
        }
    }

    // Not @Transactional: the Gemini call can take seconds and must not hold a DB connection.
    // Only the writes after the answer run in a transaction (persistInteraction).
    public AiResponse askQuestion(Long userId, UserQuestionRequest request) {
        if (userId == null) {
            return AiResponse.error("userId is required");
        }
        if (request == null || request.question() == null || request.question().isBlank()) {
            return AiResponse.error("Question cannot be empty");
        }

        // Reserved outside the try: a reached daily limit must reach the client as a 403
        // AURA_LIMIT_EXCEEDED error, not as a failed answer with HTTP 200.
        User user = userRepository.findById(userId).orElseThrow();
        java.time.LocalDate reservedOn = reserveAuraSlot(user);
        try {

            UserMemory memory = memoryService.getOrCreate(userId);
            String recent = memoryService.buildRecentConversationBlock(userId);
            String prompt = buildMemoryAwarePrompt(memory, request, recent);
            String answer = geminiClient.generateText(prompt);

            persistInteraction(user, request.question(), answer);

            return AiResponse.success(answer, geminiClient.model());
        } catch (Exception e) {
            releaseAuraSlot(userId, reservedOn);
            log.error("Error while processing memory-aware question: ", e);
            return AiResponse.error(clientErrorMessage(e));
        }
    }

    // Not @Transactional for the same reason as askQuestion.
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

        // Reserved outside the try: a reached daily limit must reach the client as a 403
        // AURA_LIMIT_EXCEEDED error, not as a failed answer with HTTP 200.
        User user = userRepository.findById(userId).orElseThrow();
        java.time.LocalDate reservedOn = reserveAuraSlot(user);
        try {

            String recent = memoryService.buildRecentConversationBlock(userId);
            String live = liveSearchResults == null ? "" : liveSearchResults;
            String prompt = agentPromptBuilder.buildPrompt(memoryData, domainContext, request, uiContext, recent, live);
            String answer = geminiClient.generateText(prompt);

            persistInteraction(user, request.question(), answer);

            return AiResponse.success(answer, geminiClient.model());
        } catch (Exception e) {
            releaseAuraSlot(userId, reservedOn);
            log.error("Error while processing agent-mode question: ", e);
            return AiResponse.error(clientErrorMessage(e));
        }
    }

    // Business rule messages (daily limit) are meant for the user; anything else stays in the log.
    private static String clientErrorMessage(Exception e) {
        if (e instanceof com.serhat.secondhand.core.exception.BusinessException) {
            return "Failed to get response: " + e.getMessage();
        }
        return "Failed to get response. Please try again shortly.";
    }

    // Counts the question before the Gemini call with one conditional UPDATE, so concurrent requests
    // cannot all pass a stale limit check. Returns the day the slot was taken on, for releaseAuraSlot.
    private java.time.LocalDate reserveAuraSlot(User user) {
        java.time.LocalDate today = java.time.LocalDate.now();
        int limit = user.getEffectivePlan().getDailyAuraLimit();
        Integer updated = transactionTemplate.execute(status ->
                userRepository.reserveAuraSlot(user.getId(), today, limit));
        if (updated == null || updated == 0) {
            throw new com.serhat.secondhand.core.exception.BusinessException(
                    "Günlük Aura AI kullanım limitinize ulaştınız.",
                    org.springframework.http.HttpStatus.FORBIDDEN, "AURA_LIMIT_EXCEEDED");
        }
        return today;
    }

    // A failed question does not count against the daily limit.
    private void releaseAuraSlot(Long userId, java.time.LocalDate reservedOn) {
        if (reservedOn == null) {
            return;
        }
        try {
            transactionTemplate.executeWithoutResult(status -> userRepository.releaseAuraSlot(userId, reservedOn));
        } catch (Exception e) {
            log.warn("Could not release Aura slot for user {}: {}", userId, e.getMessage());
        }
    }

    // The question was already counted by reserveAuraSlot before the Gemini call.
    private void persistInteraction(User checkedUser, String question, String answer) {
        Long userId = checkedUser.getId();
        transactionTemplate.executeWithoutResult(status -> {
            memoryService.storeMessage(userId, ChatRole.USER, question);
            memoryService.storeMessage(userId, ChatRole.ASSISTANT, answer);
        });
        // Runs async after the messages are committed, so the memory update sees them.
        if (memoryService.shouldUpdateMemory(userId, question)) {
            memoryService.updateMemoryFromInteraction(userId, question, answer);
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
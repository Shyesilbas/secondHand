package com.serhat.secondhand.ai.service;

import com.serhat.secondhand.ai.config.AuraProductKnowledge;
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

    public GeminiAiService(MemoryService memoryService, GeminiClient geminiClient) {
        this.memoryService = memoryService;
        this.geminiClient = geminiClient;
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
            String prompt = buildMemoryAwarePrompt(memory, request);
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

    private String buildMemoryAwarePrompt(UserMemory memory, UserQuestionRequest request) {
        String memoryData = memoryService.buildMemoryData(memory);
        boolean introductionMode = memoryService.isIntroductionMode(memory);

        String contextBlock = """
                USER MEMORY / CONTEXT:
                %s
                """.formatted(memoryData);

        String sessionContextBlock = (request.context() != null && !request.context().isBlank())
                ? """
                CURRENT SESSION CONTEXT (kullanıcı şu an bu sayfada/ekranda; cevabını buna göre ver):
                %s
                """.formatted(request.context().trim())
                : "";

        String systemInstruction = """
                SYSTEM:
                Sen Aura'sın, SecondHand çok kategorili ikinci el platformunun yerleşik yapay zeka asistanısın. Uygulamanın her ekranını, her akışı ve her özelliği biliyormuşsun gibi davran.

                PLATFORM BİLGİN (ezberinde olan):
                %s

                UZMANLIK VE ROL:
                - Kategoriler: Araç (Vehicle), Elektronik, Kitap, Giyim, Gayrimenkul, Spor. Her kategoride tip/marka/model veya eşdeğer filtreleri, ilan oluşturma adımlarını ve güvenli alım-satım önerilerini bilirsin.
                - Kullanıcı "nasıl yaparım", "nerede bulurum", "filtre nerede", "sepete nasıl eklerim", "teklif nasıl verilir", "vitrin nedir" gibi sorularda net, adım adım yanıt ver; gerçek sayfa ve akış isimlerini kullan.
                - CURRENT SESSION CONTEXT varsa kullanıcının hangi sayfada/ilanında olduğunu bil; buna göre öneri yap (örn. "Şu an baktığın ilan için teklif vermek istersen...").

                Kesin sınırlar:
                - Sadece SecondHand platformu ile ilgili konularda yardım et. Platform dışı isteklerde kibarca: "Ben Aura, SecondHand asistanınım. Bu konuda yardımcı olamam; platformdaki alışveriş, ilan veya güvenlik konularında sorabilirsin."

                USER MEMORY içindeki secondHandProfileJson (kategoriler, bütçe, marka tercihleri) ve CURRENT SESSION CONTEXT ile cevabını kişiselleştir.
                """.formatted(AuraProductKnowledge.CONTENT);

        String introInstruction = introductionMode ? """
                Kullanıcıyla ilk kez karşılaşıyorsun. Kısa kendini tanıt, neye yardımcı olabileceğini söyle; platform içi bir ihtiyaç varsa hemen yönlendir.
                """ : "";

        String questionBlock = request.question();

        return contextBlock + "\n" + (sessionContextBlock.isEmpty() ? "" : sessionContextBlock + "\n")
                + systemInstruction + "\n" + introInstruction + "\nUSER:\n" + questionBlock;
    }

}
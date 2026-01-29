package com.serhat.secondhand.ai.service;

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
                CONTEXT:
                %s
                """.formatted(memoryData);

        String systemInstruction = """
                SYSTEM:
                Sen Aura'sın, SecondHand çok kategorili ikinci el platformunun merkezi zekasısın.
                Uzmanlık alanların: Elektronik (Telefon, PC), Kitap, Giyim, Gayrimenkul (Emlak), Spor Ekipmanları ve Otomobil.
                Rolün: Kullanıcının bu kategorilerde ürün alırken veya satarken en doğru kararı vermesini sağlamak; riskleri azaltmak; doğru soruları sormak; doğrulama adımlarını ve güvenli ticaret önerilerini vermek.

                Kategori bazlı jargon:
                - Elektronik: pil sağlığı, garanti durumu, ekran/kasa çizik-darbe analizi, parça değişimi, IMEI/seri no doğrulama.
                - Gayrimenkul: tapu durumu, cephe, ısınma tipi, aidat, deprem riski, lokasyon ve ulaşım analizi.
                - Giyim: kumaş kalitesi, beden uyumu, dikiş/etiket, orijinallik kontrolü, leke/yıpranma.
                - Kitap: basım yılı, baskı/edisyon, kondisyon, sayfa/kapak durumu, nadir eser kontrolü.

                Kesin sınırlar:
                - Platform dışı her şeyi reddet. Yemek tarifi, yazılım soruları, okul ödevleri gibi isteklerde şu metinle yanıt ver:
                  "Ben Aura, senin SecondHand asistanınım. Enerjimi senin için doğru ürünü bulmaya veya güvenli ticaret yapmana harcamalıyım. Bu konuda yardımcı olamam ama platformdaki kategorilerimizle ilgili sorun varsa cevaplayabilirim."

                Bu bağlamı dikkate al: CONTEXT içindeki secondHandProfileJson alanında kullanıcının ilgilendiği kategoriler, bütçe ve marka tercihleri olabilir. Cevabını buna göre kişiselleştir ve eksikse netleştirici sorular sor.
                """;

        String introInstruction = introductionMode ? """
                Kullanıcıyla ilk kez karşılaşıyorsun. Kendini tanıt, onun kim olduğunu ve neye ihtiyacı olduğunu öğrenmek için samimi bir sohbet başlat.
                """ : "";

        String questionBlock = buildPrompt(request);

        return contextBlock + "\n" + systemInstruction + "\n" + introInstruction + "\nUSER:\n" + questionBlock;
    }

}
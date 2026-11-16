package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.ai.dto.GeminiRequest;
import com.serhat.secondhand.ai.dto.GeminiResponse;
import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class GeminiClient {

    /** Read timeout for {@link #generateStrictJson}; moderation must not hold the worker for long. */
    static final int STRICT_READ_TIMEOUT_MS = 15000;
    private static final String API_KEY_HEADER = "x-goog-api-key";
    private static final String MEMORY_FALLBACK_TEXT = "Cevap hazır";

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-3.1-flash-lite}")
    private String model = "gemini-3.1-flash-lite";

    @Value("${gemini.api.base-url:https://generativelanguage.googleapis.com}")
    private String baseUrl = "https://generativelanguage.googleapis.com";

    @Value("${gemini.api.fallback-memory-model:gemini-3.1-flash-lite}")
    private String fallbackMemoryModel = "gemini-3.1-flash-lite";

    @Value("${gemini.api.max-output-tokens:1024}")
    private int maxOutputTokens = 1024;

    @Value("${gemini.api.memory-max-output-tokens:512}")
    private int memoryMaxOutputTokens = 512;

    private final GlobalGeminiBudgetGuard budgetGuard;
    private final RestTemplate restTemplate;
    private final RestTemplate strictRestTemplate;

    public GeminiClient() {
        this(null);
    }

    @Autowired
    public GeminiClient(@Autowired(required = false) GlobalGeminiBudgetGuard budgetGuard) {
        this.budgetGuard = budgetGuard;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);

        SimpleClientHttpRequestFactory strictFactory = new SimpleClientHttpRequestFactory();
        strictFactory.setConnectTimeout(5000);
        strictFactory.setReadTimeout(STRICT_READ_TIMEOUT_MS);
        this.strictRestTemplate = new RestTemplate(strictFactory);
    }

    /**
     * One structured-output call with no retry and no fallback text: any failure, empty or blocked
     * answer throws, so callers (Aura moderation) can retry later instead of acting on a placeholder.
     */
    public String generateStrictJson(String systemInstruction, String prompt, Map<String, Object> responseSchema) {
        return generateStrictJson(systemInstruction, prompt, List.of(), responseSchema);
    }

    /**
     * Same as {@link #generateStrictJson(String, String, Map)} with images sent as inline parts
     * after the prompt, in the given order.
     */
    public String generateStrictJson(String systemInstruction, String prompt, List<InlineImage> images,
                                     Map<String, Object> responseSchema) {
        enforceGlobalDailyBudget();
        String url = buildGenerateContentUrl(model);
        List<GeminiRequest.Part> parts = new java.util.ArrayList<>();
        parts.add(new GeminiRequest.Part(prompt));
        for (InlineImage image : images) {
            parts.add(GeminiRequest.Part.image(image.mimeType(),
                    java.util.Base64.getEncoder().encodeToString(image.bytes())));
        }
        var request = new GeminiRequest(
                List.of(new GeminiRequest.Content(parts)),
                new GeminiRequest.GenerationConfig("application/json", responseSchema, resolvedTokenCap(maxOutputTokens)),
                new GeminiRequest.Content(List.of(new GeminiRequest.Part(systemInstruction))));
        GeminiResponse response;
        try {
            response = strictRestTemplate.postForObject(url, buildEntity(request), GeminiResponse.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new BusinessException(AiErrorCodes.AI_RATE_LIMIT_EXCEEDED);
        } catch (Exception e) {
            log.error("Strict Gemini call failed with model {}: {}", model, e.getClass().getSimpleName());
            throw new BusinessException(AiErrorCodes.AI_SERVICE_ERROR);
        }
        String text = extractCandidateText(response);
        if (text == null) {
            throw new BusinessException(AiErrorCodes.AI_EMPTY_RESPONSE);
        }
        return text;
    }

    /** Raw image bytes for {@link #generateStrictJson(String, String, List, Map)}. */
    public record InlineImage(String mimeType, byte[] bytes) {}

    public String model() {
        return model;
    }

    public String generateText(String message) {
        return generateTextWithModel(model, null, message, false, null, resolvedTokenCap(maxOutputTokens));
    }

    public String generateText(String systemInstruction, String message) {
        return generateTextWithModel(model, systemInstruction, message, false, null, resolvedTokenCap(maxOutputTokens));
    }

    public String generateTextForMemory(String message) {
        return generateForMemoryInternal(message, null);
    }

    public String generateJsonForMemory(String message) {
        return generateForMemoryInternal(message, "application/json");
    }

    private String generateForMemoryInternal(String message, String responseMimeType) {
        Integer tokenCap = resolvedTokenCap(memoryMaxOutputTokens);
        try {
            return generateTextWithModel(model, null, message, true, responseMimeType, tokenCap);
        } catch (BusinessException e) {
            if (AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED.getCode().equals(e.getErrorCode())) {
                throw e;
            }
            return tryFallbackMemoryModel(message, responseMimeType, tokenCap, e);
        } catch (RuntimeException e) {
            return tryFallbackMemoryModel(message, responseMimeType, tokenCap, e);
        }
    }

    private String tryFallbackMemoryModel(String message, String responseMimeType, Integer tokenCap, RuntimeException primaryError) {
        if (fallbackMemoryModel == null || fallbackMemoryModel.isBlank() || fallbackMemoryModel.equalsIgnoreCase(model)) {
            log.warn("Primary model failed for memory call (no distinct fallback configured): {}", primaryError.getMessage());
            return MEMORY_FALLBACK_TEXT;
        }
        log.warn("Primary model failed for memory call, trying fallback {}: {}", fallbackMemoryModel, primaryError.getMessage());
        try {
            return generateTextWithModel(fallbackMemoryModel, null, message, true, responseMimeType, tokenCap);
        } catch (BusinessException budgetEx) {
            if (AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED.getCode().equals(budgetEx.getErrorCode())) {
                throw budgetEx;
            }
            log.error("Fallback model failed for memory call: {}", budgetEx.getMessage());
            return MEMORY_FALLBACK_TEXT;
        } catch (RuntimeException fallbackException) {
            log.error("Fallback model also failed for memory call: {}", fallbackException.getMessage());
            return MEMORY_FALLBACK_TEXT;
        }
    }

    private String generateTextWithModel(String modelName, String systemInstruction, String message,
                                         boolean swallowRateLimit, String responseMimeType, Integer tokenCap) {
        enforceGlobalDailyBudget();
        String url = buildGenerateContentUrl(modelName);
        log.debug("Request to Gemini model: {} at URL: {}", modelName, url);

        GeminiRequest.GenerationConfig generationConfig = buildGenerationConfig(responseMimeType, tokenCap);
        GeminiRequest.Content systemContent = (systemInstruction != null && !systemInstruction.isBlank())
                ? new GeminiRequest.Content(List.of(new GeminiRequest.Part(systemInstruction)))
                : null;

        var request = new GeminiRequest(
                List.of(new GeminiRequest.Content(List.of(new GeminiRequest.Part(message)))),
                generationConfig,
                systemContent
        );

        try {
            GeminiResponse response = restTemplate.postForObject(url, buildEntity(request), GeminiResponse.class);
            String responseText = extractCandidateText(response);
            if (responseText != null) {
                log.info("Response received successfully from model {}: {} characters", modelName, responseText.length());
                return responseText;
            }
            log.warn("Empty or safety-filtered Gemini response from model {}", modelName);
            return "Empty response from AI.";
        } catch (HttpClientErrorException.TooManyRequests e) {
            if (swallowRateLimit) {
                log.warn("Upstream Gemini rate limit hit for memory call on model {}", modelName);
                return MEMORY_FALLBACK_TEXT;
            }
            log.warn("Upstream Gemini rate limit exceeded for model {}", modelName);
            throw new BusinessException(AiErrorCodes.AI_RATE_LIMIT_EXCEEDED);
        } catch (HttpClientErrorException e) {
            log.error("HTTP Error calling Gemini API: Model={}, Status={}", modelName, e.getStatusCode());
            throw new BusinessException(AiErrorCodes.AI_SERVICE_ERROR);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini API with model {}: {}", modelName, e.getClass().getSimpleName());
            throw new BusinessException(AiErrorCodes.AI_UNEXPECTED_ERROR);
        }
    }

    private void enforceGlobalDailyBudget() {
        if (budgetGuard != null) {
            budgetGuard.checkAndConsumeDailyBudget();
        }
    }

    private HttpEntity<GeminiRequest> buildEntity(GeminiRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set(API_KEY_HEADER, apiKey);
        }
        return new HttpEntity<>(request, headers);
    }

    private static GeminiRequest.GenerationConfig buildGenerationConfig(String responseMimeType, Integer tokenCap) {
        String normalizedMime = (responseMimeType != null && !responseMimeType.isBlank()) ? responseMimeType : null;
        if (normalizedMime == null && tokenCap == null) {
            return null;
        }
        return new GeminiRequest.GenerationConfig(normalizedMime, null, tokenCap);
    }

    private static Integer resolvedTokenCap(int configured) {
        return configured > 0 ? configured : null;
    }

    private static String extractCandidateText(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return null;
        }
        GeminiResponse.Candidate first = response.candidates().get(0);
        if (first == null || first.content() == null || first.content().parts() == null || first.content().parts().isEmpty()) {
            return null;
        }
        GeminiResponse.Part part = first.content().parts().get(0);
        return part == null ? null : part.text();
    }

    private String buildGenerateContentUrl(String modelName) {
        String normalizedBaseUrl = baseUrl == null ? "https://generativelanguage.googleapis.com" : baseUrl;
        while (normalizedBaseUrl.endsWith("/")) {
            normalizedBaseUrl = normalizedBaseUrl.substring(0, normalizedBaseUrl.length() - 1);
        }

        if (!normalizedBaseUrl.matches(".*/v\\d+(beta)?/models$")) {
            normalizedBaseUrl += "/v1beta/models";
        }

        return normalizedBaseUrl + "/" + modelName + ":generateContent";
    }
}

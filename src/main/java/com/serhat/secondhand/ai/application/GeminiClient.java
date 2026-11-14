package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.ai.dto.GeminiRequest;
import com.serhat.secondhand.ai.dto.GeminiResponse;
import com.serhat.secondhand.core.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@Slf4j
public class GeminiClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-3.1-flash-lite}")
    private String model;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    @Value("${gemini.api.fallback-memory-model:gemini-3.1-flash-lite}")
    private String fallbackMemoryModel;

    private final RestTemplate restTemplate;
    private final RestTemplate strictRestTemplate;

    public GeminiClient() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);

        org.springframework.http.client.SimpleClientHttpRequestFactory strictFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        strictFactory.setConnectTimeout(5000);
        strictFactory.setReadTimeout(STRICT_READ_TIMEOUT_MS);
        this.strictRestTemplate = new RestTemplate(strictFactory);
    }

    /** Read timeout for {@link #generateStrictJson}; moderation must not hold the worker for long. */
    static final int STRICT_READ_TIMEOUT_MS = 15000;

    /**
     * One structured-output call with no retry and no fallback text: any failure, empty or blocked
     * answer throws, so callers (Aura moderation) can retry later instead of acting on a placeholder.
     */
    public String generateStrictJson(String systemInstruction, String prompt, java.util.Map<String, Object> responseSchema) {
        return generateStrictJson(systemInstruction, prompt, List.of(), responseSchema);
    }

    /**
     * Same as {@link #generateStrictJson(String, String, java.util.Map)} with images sent as inline parts
     * after the prompt, in the given order.
     */
    public String generateStrictJson(String systemInstruction, String prompt, List<InlineImage> images,
                                     java.util.Map<String, Object> responseSchema) {
        String url = buildGenerateContentUrl(model);
        List<GeminiRequest.Part> parts = new java.util.ArrayList<>();
        parts.add(new GeminiRequest.Part(prompt));
        for (InlineImage image : images) {
            parts.add(GeminiRequest.Part.image(image.mimeType(),
                    java.util.Base64.getEncoder().encodeToString(image.bytes())));
        }
        var request = new GeminiRequest(
                List.of(new GeminiRequest.Content(parts)),
                new GeminiRequest.GenerationConfig("application/json", responseSchema),
                new GeminiRequest.Content(List.of(new GeminiRequest.Part(systemInstruction))));
        GeminiResponse response;
        try {
            response = strictRestTemplate.postForObject(url, request, GeminiResponse.class);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new BusinessException("The AI service is rate limited.", HttpStatus.TOO_MANY_REQUESTS, "AI_RATE_LIMIT_EXCEEDED");
        } catch (Exception e) {
            log.error("Strict Gemini call failed with model {}: {}", model, e.getMessage());
            throw new BusinessException("The AI service encountered an error.", HttpStatus.BAD_GATEWAY, "AI_SERVICE_ERROR");
        }
        if (response == null || response.candidates() == null || response.candidates().isEmpty()
                || response.candidates().get(0).content() == null
                || response.candidates().get(0).content().parts() == null
                || response.candidates().get(0).content().parts().isEmpty()) {
            throw new BusinessException("The AI service returned no answer.", HttpStatus.BAD_GATEWAY, "AI_EMPTY_RESPONSE");
        }
        return response.candidates().get(0).content().parts().get(0).text();
    }

    /** Raw image bytes for {@link #generateStrictJson(String, String, List, java.util.Map)}. */
    public record InlineImage(String mimeType, byte[] bytes) {}

    public String model() {
        return model;
    }

    public String generateText(String message) {
        return generateTextWithModel(model, null, message, false, null);
    }

    public String generateText(String systemInstruction, String message) {
        return generateTextWithModel(model, systemInstruction, message, false, null);
    }

    public String generateTextForMemory(String message) {
        return generateForMemoryInternal(message, null);
    }

    public String generateJsonForMemory(String message) {
        return generateForMemoryInternal(message, "application/json");
    }

    private String generateForMemoryInternal(String message, String responseMimeType) {
        try {
            return generateTextWithModel(model, null, message, true, responseMimeType);
        } catch (RuntimeException e) {
            log.warn("Primary model failed for memory extraction: {}", e.getMessage());
            try {
                return generateTextWithModel(fallbackMemoryModel, null, message, true, responseMimeType);
            } catch (RuntimeException fallbackException) {
                log.error("Fallback model also failed for memory extraction: {}", fallbackException.getMessage(), fallbackException);
                return "Cevap hazır";
            }
        }
    }

    private String generateTextWithModel(String modelName, String systemInstruction, String message,
                                         boolean swallowRateLimit, String responseMimeType) {
        String url = buildGenerateContentUrl(modelName);
        log.debug("Request to model: {} at URL: {}", modelName, url.replace(apiKey, "***"));

        GeminiRequest.GenerationConfig generationConfig = (responseMimeType != null && !responseMimeType.isBlank())
                ? new GeminiRequest.GenerationConfig(responseMimeType)
                : null;

        GeminiRequest.Content systemContent = (systemInstruction != null && !systemInstruction.isBlank())
                ? new GeminiRequest.Content(List.of(new GeminiRequest.Part(systemInstruction)))
                : null;

        var request = new GeminiRequest(
                List.of(new GeminiRequest.Content(List.of(new GeminiRequest.Part(message)))),
                generationConfig,
                systemContent
        );

        long[] backoffMillis = {3000L, 3000L};
        int maxAttempts = backoffMillis.length + 1;
        int attempt = 0;

        while (attempt < maxAttempts) {
            try {
                GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

                if (response != null && response.candidates() != null && !response.candidates().isEmpty()) {
                    String responseText = response.candidates().get(0).content().parts().get(0).text();
                    log.info("Response received successfully from model {}: {} characters", modelName, responseText.length());
                    return responseText;
                }

                log.warn("Empty response received for message: {}", message);
                return "Empty response from AI.";

            } catch (HttpClientErrorException.TooManyRequests e) {
                if (attempt >= maxAttempts - 1) {
                    if (swallowRateLimit) {
                        log.warn("Rate limit exceeded for model {}: {}", modelName, e.getMessage());
                        return "Cevap hazır";
                    }
                    log.error("Rate limit exceeded for model {} after {} attempts: {}", modelName, maxAttempts, e.getMessage(), e);
                    throw new BusinessException("The AI service is temporarily unavailable. Please try again in a few minutes.", HttpStatus.TOO_MANY_REQUESTS, "AI_RATE_LIMIT_EXCEEDED");
                }
                long waitTime = backoffMillis[attempt];
                log.warn("Rate limit exceeded for model {}. Attempt {}/{}. Waiting {}ms. Error: {}", 
                        modelName, attempt + 1, maxAttempts, waitTime, e.getMessage());
                try {
                    Thread.sleep(waitTime);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.error("Thread interrupted while waiting for retry: {}", ie.getMessage(), ie);
                    throw new BusinessException("The request was interrupted. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR, "AI_REQUEST_INTERRUPTED");
                }
                attempt++;

            } catch (HttpClientErrorException e) {
                log.error("HTTP Error calling Gemini API: Status={}, Body={}, Message={}", 
                        e.getStatusCode(), e.getResponseBodyAsString(), e.getMessage(), e);
                throw new BusinessException("The AI service encountered an error. Please try again later.", HttpStatus.BAD_GATEWAY, "AI_SERVICE_ERROR");

            } catch (Exception e) {
                log.error("Unexpected error calling Gemini API with model {}: {}", modelName, e.getMessage(), e);
                throw new BusinessException("An unexpected error occurred. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR, "AI_UNEXPECTED_ERROR");
            }
        }

        throw new BusinessException("Request failed after maximum retries.", HttpStatus.SERVICE_UNAVAILABLE, "AI_MAX_RETRIES_EXCEEDED");
    }

    private String buildGenerateContentUrl(String modelName) {
        String normalizedBaseUrl = baseUrl;
        while (normalizedBaseUrl.endsWith("/")) {
            normalizedBaseUrl = normalizedBaseUrl.substring(0, normalizedBaseUrl.length() - 1);
        }

        if (!normalizedBaseUrl.matches(".*/v\\d+(beta)?/models$")) {
            normalizedBaseUrl += "/v1beta/models";
        }

        return normalizedBaseUrl + "/" + modelName + ":generateContent?key=" + apiKey;
    }
}

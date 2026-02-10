package com.serhat.secondhand.ai.service;

import com.serhat.secondhand.ai.dto.GeminiRequest;
import com.serhat.secondhand.ai.dto.GeminiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@Slf4j
public class GeminiClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    @Value("${gemini.api.fallback-memory-model:gemini-2.0-flash-lite}")
    private String fallbackMemoryModel;

    private final RestTemplate restTemplate = new RestTemplate();

    public String model() {
        return model;
    }

    public String generateText(String message) {
        return generateTextWithModel(model, message, false);
    }

    public String generateTextForMemory(String message) {
        try {
            return generateTextWithModel(model, message, true);
        } catch (RuntimeException e) {
            log.warn("Primary model failed for memory extraction: {}", e.getMessage());
            try {
                return generateTextWithModel(fallbackMemoryModel, message, true);
            } catch (RuntimeException fallbackException) {
                log.error("Fallback model also failed for memory extraction: {}", fallbackException.getMessage(), fallbackException);
                return "Cevap hazır";
            }
        }
    }

    private String generateTextWithModel(String modelName, String message, boolean swallowRateLimit) {
        String url = baseUrl + "/" + modelName + ":generateContent?key=" + apiKey;
        log.debug("Request to model: {} at URL: {}", modelName, baseUrl + "/" + modelName);

        var request = new GeminiRequest(List.of(
                new GeminiRequest.Content(List.of(
                        new GeminiRequest.Part(message)
                ))
        ));

        long[] backoffMillis = {3000L, 3000L};
        int maxAttempts = backoffMillis.length + 1;
        int attempt = 0;

        while (attempt < maxAttempts) {
            try {
                GeminiResponse response = restTemplate.postForObject(url, request, GeminiResponse.class);

                if (response != null && response.candidates() != null && !response.candidates().isEmpty()) {
                    String responseText = response.candidates().get(0).content().parts().get(0).text();
                    log.info("Response received successfully: {} characters", responseText.length());
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
                    throw new RuntimeException("The AI service is temporarily unavailable. Please try again in a few minutes.");
                }
                long waitTime = backoffMillis[attempt];
                log.warn("Rate limit exceeded for model {}. Attempt {}/{}. Waiting {}ms. Error: {}", 
                        modelName, attempt + 1, maxAttempts, waitTime, e.getMessage());
                try {
                    Thread.sleep(waitTime);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.error("Thread interrupted while waiting for retry: {}", ie.getMessage(), ie);
                    throw new RuntimeException("The request was interrupted. Please try again.", ie);
                }
                attempt++;

            } catch (HttpClientErrorException e) {
                log.error("HTTP Error calling Gemini API: Status={}, Body={}, Message={}", 
                        e.getStatusCode(), e.getResponseBodyAsString(), e.getMessage(), e);
                throw new RuntimeException("The AI service encountered an error. Please try again later.");

            } catch (Exception e) {
                log.error("Unexpected error calling Gemini API with model {}: {}", modelName, e.getMessage(), e);
                throw new RuntimeException("An unexpected error occurred. Please try again later.");
            }
        }

        throw new RuntimeException("Request failed after maximum retries.");
    }
}

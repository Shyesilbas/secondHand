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
            try {
                return generateTextWithModel(fallbackMemoryModel, message, true);
            } catch (RuntimeException ignored) {
                log.warn("Memory analysis skipped due to rate limiting");
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
                        log.warn("Rate limit exceeded for model: {}", modelName);
                        return "Cevap hazır";
                    }
                    throw new RuntimeException("Rate limit exceeded. Please try again in a few minutes.");
                }
                long waitTime = backoffMillis[attempt];
                log.warn("Rate limit exceeded. Attempt {}/{}. Waiting {}ms", attempt + 1, maxAttempts, waitTime);
                try {
                    Thread.sleep(waitTime);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Process interrupted", ie);
                }
                attempt++;

            } catch (HttpClientErrorException e) {
                log.error("HTTP Error: Status={}, Body={}", e.getStatusCode(), e.getResponseBodyAsString());
                throw new RuntimeException("API Error: " + e.getStatusCode() + " - " + e.getMessage());

            } catch (Exception e) {
                log.error("Unexpected Gemini API Error: ", e);
                throw new RuntimeException("Unexpected error occurred: " + e.getMessage());
            }
        }

        throw new RuntimeException("Request failed after maximum retries.");
    }
}

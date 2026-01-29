package com.serhat.secondhand.ai.service;

import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.GeminiRequest;
import com.serhat.secondhand.ai.dto.GeminiResponse;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@Slf4j
public class GeminiAiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String testConnection(String message) {
        log.info("Test connection with message: {}", message.substring(0, Math.min(50, message.length())));
        return callGeminiApi(message);
    }

    public AiResponse askQuestion(UserQuestionRequest request) {
        log.info("User question received: {} characters", request.question().length());

        try {
            String prompt = buildPrompt(request);
            String answer = callGeminiApi(prompt);
            return AiResponse.success(answer, model);
        } catch (Exception e) {
            log.error("Error while processing question: ", e);
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

    private String callGeminiApi(String message) {
        String url = baseUrl + "/" + model + ":generateContent?key=" + apiKey;
        log.debug("Request to model: {} at URL: {}", model, baseUrl + "/" + model);

        var request = new GeminiRequest(List.of(
                new GeminiRequest.Content(List.of(
                        new GeminiRequest.Part(message)
                ))
        ));

        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries) {
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
                retryCount++;
                log.warn("Rate limit exceeded. Retry {}/{}", retryCount, maxRetries);

                if (retryCount < maxRetries) {
                    try {
                        long waitTime = (long) Math.pow(2, retryCount) * 1000;
                        log.info("Waiting {}ms before retry...", waitTime);
                        Thread.sleep(waitTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Sleep interrupted", ie);
                        throw new RuntimeException("Process interrupted", ie);
                    }
                } else {
                    log.error("Max retry limit reached: {}", e.getMessage());
                    throw new RuntimeException("Rate limit exceeded. Please try again in a few minutes.");
                }

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
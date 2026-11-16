package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.ai.dto.GeminiRequest;
import com.serhat.secondhand.ai.dto.GeminiResponse;
import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeminiClientSecurityTest {

    @Mock
    private GlobalGeminiBudgetGuard budgetGuard;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private RestTemplate strictRestTemplate;

    private GeminiClient geminiClient;

    @BeforeEach
    void setUp() {
        geminiClient = new GeminiClient(budgetGuard);
        ReflectionTestUtils.setField(geminiClient, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(geminiClient, "strictRestTemplate", strictRestTemplate);
        ReflectionTestUtils.setField(geminiClient, "apiKey", "test-secret-api-key");
        ReflectionTestUtils.setField(geminiClient, "model", "gemini-test");
        ReflectionTestUtils.setField(geminiClient, "fallbackMemoryModel", "gemini-test");
        ReflectionTestUtils.setField(geminiClient, "maxOutputTokens", 1024);
        ReflectionTestUtils.setField(geminiClient, "memoryMaxOutputTokens", 512);
    }

    @Test
    void sendsApiKeyInHeaderNotUrlAndIncludesMaxOutputTokens() {
        GeminiResponse ok = new GeminiResponse(List.of(
                new GeminiResponse.Candidate(new GeminiResponse.Content(List.of(new GeminiResponse.Part("Merhaba"))))
        ));
        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(GeminiResponse.class)))
                .thenReturn(ok);

        String reply = geminiClient.generateText("sys", "hello");

        assertThat(reply).isEqualTo("Merhaba");

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<HttpEntity<GeminiRequest>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(budgetGuard).checkAndConsumeDailyBudget();
        verify(restTemplate).postForObject(urlCaptor.capture(), entityCaptor.capture(), eq(GeminiResponse.class));

        assertThat(urlCaptor.getValue())
                .doesNotContain("key=")
                .doesNotContain("test-secret-api-key")
                .endsWith("/v1beta/models/gemini-test:generateContent");
        assertThat(entityCaptor.getValue().getHeaders().getFirst("x-goog-api-key"))
                .isEqualTo("test-secret-api-key");
        assertThat(entityCaptor.getValue().getBody()).isNotNull();
        assertThat(entityCaptor.getValue().getBody().generationConfig()).isNotNull();
        assertThat(entityCaptor.getValue().getBody().generationConfig().maxOutputTokens()).isEqualTo(1024);
    }

    @Test
    void enforcesGlobalDailyBudgetBeforeAnyHttpCall() {
        doThrow(new BusinessException(AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED))
                .when(budgetGuard).checkAndConsumeDailyBudget();

        assertThatThrownBy(() -> geminiClient.generateText("hello"))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED.getCode());

        assertThatThrownBy(() -> geminiClient.generateJsonForMemory("extract"))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED.getCode());

        assertThatThrownBy(() -> geminiClient.generateStrictJson("sys", "prompt", Map.of("type", "object")))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED.getCode());

        verifyNoInteractions(restTemplate, strictRestTemplate);
    }

    @Test
    void handlesSafetyFilteredNullCandidateContentWithoutNullPointerException() {
        GeminiResponse safetyFiltered = new GeminiResponse(List.of(
                new GeminiResponse.Candidate(null)
        ));
        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(GeminiResponse.class)))
                .thenReturn(safetyFiltered);

        String reply = geminiClient.generateText("hello");
        assertThat(reply).isEqualTo("Empty response from AI.");

        GeminiResponse emptyParts = new GeminiResponse(List.of(
                new GeminiResponse.Candidate(new GeminiResponse.Content(null))
        ));
        when(strictRestTemplate.postForObject(anyString(), any(HttpEntity.class), eq(GeminiResponse.class)))
                .thenReturn(emptyParts);

        assertThatThrownBy(() -> geminiClient.generateStrictJson("sys", "prompt", Map.of("type", "object")))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(AiErrorCodes.AI_EMPTY_RESPONSE.getCode());
    }
}

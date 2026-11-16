package com.serhat.secondhand.ai.api;

import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai/tests")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Gemini", description = "Gemini operations")
public class GeminiController {

    private static final int MAX_QUESTION_CHARS = 2000;
    private static final int MIN_QUESTION_CHARS = 3;
    private static final int MAX_HELLO_CHARS = 500;

    private final GeminiAiService aiService;

    @GetMapping("/gemini/hello")
    public String helloAi(@RequestParam(defaultValue = "Hi, which model you are?") String message) {
        if (message == null || message.isBlank() || message.trim().length() > MAX_HELLO_CHARS) {
            throw new BusinessException(AiErrorCodes.AI_INVALID_REQUEST);
        }
        return aiService.testConnection(message.trim());
    }

    // With context
    @PostMapping("/ask")
    public ResponseEntity<AiResponse> askQuestion(@Valid @RequestBody UserQuestionRequest request) {
        log.info("New question received: {}", request.question().substring(0, Math.min(50, request.question().length())));
        AiResponse response = aiService.askQuestion(request);
        return ResultResponses.ok(Result.success(response));
    }

    // No context
    @GetMapping("/quick")
    public ResponseEntity<AiResponse> quickQuestion(@RequestParam("q") String question) {
        String trimmed = question == null ? "" : question.trim();
        if (trimmed.length() < MIN_QUESTION_CHARS || trimmed.length() > MAX_QUESTION_CHARS) {
            throw new BusinessException(AiErrorCodes.AI_INVALID_REQUEST);
        }

        log.info("Quick question: {}", trimmed.substring(0, Math.min(50, trimmed.length())));
        UserQuestionRequest request = new UserQuestionRequest(trimmed, null);
        AiResponse response = aiService.askQuestion(request);
        return ResultResponses.ok(Result.success(response));
    }

}

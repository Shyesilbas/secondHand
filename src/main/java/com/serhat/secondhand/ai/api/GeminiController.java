package com.serhat.secondhand.ai.api;

import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai/tests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Gemini", description = "Gemini operations")
public class GeminiController {

    private final GeminiAiService aiService;

    @GetMapping("/gemini/hello")
    public String helloAi(@RequestParam(defaultValue = "Hi, which model you are?") String message) {
        return aiService.testConnection(message);
    }

    // With context
    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(@Valid @RequestBody UserQuestionRequest request) {
        log.info("New question received: {}", request.question().substring(0, Math.min(50, request.question().length())));
        AiResponse response = aiService.askQuestion(request);
        return ResultResponses.ok(Result.success(response));
    }

    // No context
    @GetMapping("/quick")
    public ResponseEntity<?> quickQuestion(@RequestParam("q") String question) {
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("Question cannot be empty");
        }

        log.info("Quick question: {}", question.substring(0, Math.min(50, question.length())));
        UserQuestionRequest request = new UserQuestionRequest(question, null);
        AiResponse response = aiService.askQuestion(request);
        return ResultResponses.ok(Result.success(response));
    }

}

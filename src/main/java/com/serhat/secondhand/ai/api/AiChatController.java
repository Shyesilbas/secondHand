package com.serhat.secondhand.ai.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.ChatRequest;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "Ai Chat", description = "Ai Chat operations")
public class AiChatController {

    private final GeminiAiService geminiAiService;
    private final MemoryService memoryService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@AuthenticationPrincipal User user, @Valid @RequestBody ChatRequest request) {
        Long userId = user.getId();
        UserQuestionRequest question = new UserQuestionRequest(request.message(), request.context());
        return ResultResponses.ok(Result.success(geminiAiService.askQuestion(userId, question)));
    }

    @PostMapping("/chat/new")
    public ResponseEntity<?> newChat(@AuthenticationPrincipal User user) {
        Long userId = user.getId();
        memoryService.clearConversationHistory(userId);
        return ResultResponses.noContent(Result.success());
    }

    @DeleteMapping("/chat/history")
    public ResponseEntity<?> deleteHistory(@AuthenticationPrincipal User user) {
        Long userId = user.getId();
        memoryService.clearConversationHistory(userId);
        return ResultResponses.noContent(Result.success());
    }

    @DeleteMapping("/memory")
    public ResponseEntity<?> deleteMemory(@AuthenticationPrincipal User user) {
        Long userId = user.getId();
        memoryService.deleteMemory(userId);
        return ResultResponses.noContent(Result.success());
    }
}

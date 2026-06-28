package com.serhat.secondhand.ai.api;

import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.ai.dto.ChatRequest;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "Ai Chat", description = "Ai Chat operations")
public class AiChatController {

    private final GeminiAiService geminiAiService;
    private final MemoryService memoryService;

    @PostMapping("/chats")
    public ResponseEntity<?> chat(@AuthenticationPrincipal User user, @Valid @RequestBody ChatRequest request) {
        Long userId = user.getId();
        UserQuestionRequest question = new UserQuestionRequest(request.message(), request.context());
        return ResultResponses.ok(Result.success(geminiAiService.askQuestion(userId, question)));
    }

    @PostMapping("/chats/new")
    public ResponseEntity<?> newChat(@AuthenticationPrincipal User user) {
        Long userId = user.getId();
        memoryService.clearConversationHistory(userId);
        return ResultResponses.noContent(Result.success());
    }

    @DeleteMapping("/chats/history")
    public ResponseEntity<?> deleteHistory(@AuthenticationPrincipal User user) {
        Long userId = user.getId();
        memoryService.clearConversationHistory(userId);
        return ResultResponses.noContent(Result.success());
    }

    @DeleteMapping("/memories")
    public ResponseEntity<?> deleteMemory(@AuthenticationPrincipal User user) {
        Long userId = user.getId();
        memoryService.deleteMemory(userId);
        return ResultResponses.noContent(Result.success());
    }

    @GetMapping("/memories")
    public ResponseEntity<?> getMemory(@AuthenticationPrincipal User user) {
        return ResultResponses.ok(Result.success(memoryService.getMemoryDto(user.getId())));
    }

    @PutMapping("/memories")
    public ResponseEntity<?> updateMemory(@AuthenticationPrincipal User user, @RequestBody com.serhat.secondhand.ai.dto.UserMemoryDto dto) {
        memoryService.updateMemory(user.getId(), dto);
        return ResultResponses.ok(Result.success());
    }

    @DeleteMapping("/memories/interests")
    public ResponseEntity<?> deleteInterest(@AuthenticationPrincipal User user, @RequestParam String interest) {
        memoryService.removeInterest(user.getId(), interest);
        return ResultResponses.noContent(Result.success());
    }
}


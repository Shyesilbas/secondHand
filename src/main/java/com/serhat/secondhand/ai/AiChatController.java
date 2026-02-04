package com.serhat.secondhand.ai;

import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.ChatRequest;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import com.serhat.secondhand.ai.service.GeminiAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final GeminiAiService geminiAiService;
    private final MemoryService memoryService;

    @PostMapping("/chat")
    public ResponseEntity<AiResponse> chat(@RequestParam Long userId, @Valid @RequestBody ChatRequest request) {
        UserQuestionRequest question = new UserQuestionRequest(request.message(), request.context());
        return ResponseEntity.ok(geminiAiService.askQuestion(userId, question));
    }

    @PostMapping("/chat/new")
    public ResponseEntity<Void> newChat(@RequestParam Long userId) {
        memoryService.clearConversationHistory(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/chat/history")
    public ResponseEntity<Void> deleteHistory(@RequestParam Long userId) {
        memoryService.clearConversationHistory(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/memory")
    public ResponseEntity<Void> deleteMemory(@RequestParam Long userId) {
        memoryService.deleteMemory(userId);
        return ResponseEntity.noContent().build();
    }
}

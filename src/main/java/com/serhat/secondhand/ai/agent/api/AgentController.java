package com.serhat.secondhand.ai.agent.api;

import com.serhat.secondhand.ai.agent.dto.AgentQueryRequest;
import com.serhat.secondhand.ai.agent.dto.AgentQueryResponse;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.agent.query.AgentQueryService;
import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/agent")
@RequiredArgsConstructor
public class AgentController {

    private final GeminiAiService geminiAiService;
    private final AgentQueryService agentQueryService;

    @PostMapping("/query")
    public ResponseEntity<AgentQueryResponse> query(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AgentQueryRequest request
    ) {
        Long userId = user.getId();
        UserQuestionRequest question = new UserQuestionRequest(request.message(), request.context());

        AgentQueryService.AgentContextBundle contextBundle = agentQueryService.buildContext(userId, request.uiContext());
        AiResponse aiResponse = geminiAiService.askAgentQuestion(
                userId,
                question,
                contextBundle.memoryData(),
                contextBundle.domainContext(),
                request.uiContext()
        );

        if (aiResponse.success()) {
            return ResponseEntity.ok(AgentQueryResponse.success(
                    aiResponse.answer(),
                    aiResponse.model(),
                    contextBundle.dataSources()
            ));
        }

        return ResponseEntity.ok(AgentQueryResponse.error(aiResponse.error(), contextBundle.dataSources()));
    }
}

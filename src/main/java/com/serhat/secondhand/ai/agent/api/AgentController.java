package com.serhat.secondhand.ai.agent.api;

import com.serhat.secondhand.ai.agent.dto.AgentQueryRequest;
import com.serhat.secondhand.ai.agent.dto.AgentQueryResponse;
import com.serhat.secondhand.ai.agent.query.AgentQueryService;
import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai/agents")
@RequiredArgsConstructor
@Tag(name = "Agent", description = "Agent operations")
public class AgentController {

    private final AgentQueryService agentQueryService;

    @PostMapping("/query")
    public ResponseEntity<AgentQueryResponse> query(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AgentQueryRequest request
    ) {
        if (user == null) {
            throw new BusinessException(AiErrorCodes.AI_AUTHENTICATION_REQUIRED);
        }
        return ResponseEntity.ok(agentQueryService.executeQuery(user.getId(), request));
    }
}

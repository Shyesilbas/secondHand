package com.serhat.secondhand.ai.agent.api;

import com.serhat.secondhand.ai.agent.dto.AgentDataSourceDto;
import com.serhat.secondhand.ai.agent.dto.AgentQueryRequest;
import com.serhat.secondhand.ai.agent.dto.AgentQueryResponse;
import com.serhat.secondhand.ai.agent.query.AgentQueryService;
import com.serhat.secondhand.ai.agent.search.AgentSearchAugmentation;
import com.serhat.secondhand.ai.agent.search.AuraListingSearchOrchestrator;
import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/ai/agent")
@RequiredArgsConstructor
public class AgentController {

    private final GeminiAiService geminiAiService;
    private final AgentQueryService agentQueryService;
    private final AuraListingSearchOrchestrator listingSearchOrchestrator;

    @PostMapping("/query")
    public ResponseEntity<AgentQueryResponse> query(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AgentQueryRequest request
    ) {
        Long userId = user.getId();
        UserQuestionRequest question = new UserQuestionRequest(request.message(), request.context());

        AgentQueryService.AgentContextBundle contextBundle = agentQueryService.buildContext(userId, request.uiContext());
        AgentSearchAugmentation searchAug = listingSearchOrchestrator.augment(userId, request.message(), contextBundle.memoryData());

        List<AgentDataSourceDto> dataSources = new ArrayList<>(contextBundle.dataSources());
        if (searchAug.liveSearchBlock() != null && !searchAug.liveSearchBlock().isBlank()) {
            dataSources.add(new AgentDataSourceDto("search_results", searchAug.dataSourceStatus()));
        }

        AiResponse aiResponse = geminiAiService.askAgentQuestion(
                userId,
                question,
                contextBundle.memoryData(),
                contextBundle.domainContext(),
                request.uiContext(),
                searchAug.liveSearchBlock()
        );

        if (aiResponse.success()) {
            return ResponseEntity.ok(AgentQueryResponse.success(
                    aiResponse.answer(),
                    aiResponse.model(),
                    dataSources,
                    searchAug.suggestedListings()
            ));
        }

        return ResponseEntity.ok(AgentQueryResponse.error(aiResponse.error(), dataSources));
    }
}

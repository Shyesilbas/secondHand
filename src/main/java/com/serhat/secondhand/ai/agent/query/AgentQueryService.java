package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentDataSourceDto;
import com.serhat.secondhand.ai.agent.dto.AgentQueryRequest;
import com.serhat.secondhand.ai.agent.dto.AgentQueryResponse;
import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.agent.search.AgentSearchAugmentation;
import com.serhat.secondhand.ai.agent.search.AuraListingSearchOrchestrator;
import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class AgentQueryService {

    private final MemoryService memoryService;
    private final List<AgentContextAdapter> contextAdapters;
    private final Executor taskExecutor;
    private final GeminiAiService geminiAiService;
    private final AuraListingSearchOrchestrator listingSearchOrchestrator;

    public AgentQueryService(
            MemoryService memoryService,
            List<AgentContextAdapter> contextAdapters,
            Executor taskExecutor
    ) {
        this(memoryService, contextAdapters, taskExecutor, null, null);
    }

    @Autowired
    public AgentQueryService(
            MemoryService memoryService,
            List<AgentContextAdapter> contextAdapters,
            @Qualifier("taskExecutor") Executor taskExecutor,
            GeminiAiService geminiAiService,
            AuraListingSearchOrchestrator listingSearchOrchestrator
    ) {
        this.memoryService = memoryService;
        this.contextAdapters = contextAdapters;
        this.taskExecutor = taskExecutor;
        this.geminiAiService = geminiAiService;
        this.listingSearchOrchestrator = listingSearchOrchestrator;
    }

    /**
     * Reserves the user's daily Aura quota BEFORE invoking search-planning or answer Gemini calls,
     * preventing exhausted accounts from triggering free search-planner LLM calls.
     */
    public AgentQueryResponse executeQuery(Long userId, AgentQueryRequest request) {
        if (userId == null) {
            throw new BusinessException(AiErrorCodes.AI_AUTHENTICATION_REQUIRED);
        }
        if (request == null || request.message() == null || request.message().isBlank()) {
            return AgentQueryResponse.error("Question cannot be empty", List.of());
        }

        LocalDate reservedOn = geminiAiService.reserveAuraSlotForUser(userId);
        List<AgentDataSourceDto> dataSources = List.of();
        try {
            UserQuestionRequest question = new UserQuestionRequest(request.message(), request.context());
            AgentContextBundle contextBundle = buildContext(userId, request.uiContext());
            List<AgentDataSourceDto> collectedSources = new ArrayList<>(contextBundle.dataSources());
            dataSources = collectedSources;

            AgentSearchAugmentation searchAug = listingSearchOrchestrator.augment(
                    userId, request.message(), contextBundle.memoryData());
            if (searchAug.liveSearchBlock() != null && !searchAug.liveSearchBlock().isBlank()) {
                collectedSources.add(new AgentDataSourceDto("search_results", searchAug.dataSourceStatus()));
            }

            AiResponse aiResponse = geminiAiService.askAgentQuestionWithReservedSlot(
                    userId,
                    reservedOn,
                    question,
                    contextBundle.memoryData(),
                    contextBundle.domainContext(),
                    request.uiContext(),
                    searchAug.liveSearchBlock()
            );

            if (aiResponse.success()) {
                return AgentQueryResponse.success(
                        aiResponse.answer(),
                        aiResponse.model(),
                        collectedSources,
                        searchAug.suggestedListings()
                );
            }
            return AgentQueryResponse.error(aiResponse.error(), collectedSources);
        } catch (BusinessException e) {
            geminiAiService.releaseAuraSlotForUser(userId, reservedOn);
            return AgentQueryResponse.error("Failed to get response: " + e.getMessage(), dataSources);
        } catch (RuntimeException e) {
            geminiAiService.releaseAuraSlotForUser(userId, reservedOn);
            return AgentQueryResponse.error("Failed to get response. Please try again shortly.", dataSources);
        }
    }

    public AgentContextBundle buildContext(Long userId, AgentUiContextRequest uiContext) {
        String memoryData = (userId != null)
                ? memoryService.buildMemoryData(memoryService.getOrCreate(userId))
                : "";

        List<CompletableFuture<AgentContextSection>> futures = contextAdapters.stream()
                .map(adapter -> CompletableFuture.supplyAsync(() -> adapter.fetch(userId, uiContext), taskExecutor))
                .toList();

        List<AgentContextSection> sections = futures.stream()
                .map(CompletableFuture::join)
                .toList();

        String domainContext = sections.stream()
                .map(section -> section.source().toUpperCase() + " [" + section.status() + "]\n" + section.summary())
                .reduce((a, b) -> a + "\n\n" + b)
                .orElse("No additional domain context is available.");

        List<AgentDataSourceDto> dataSources = sections.stream()
                .map(section -> new AgentDataSourceDto(section.source(), section.status()))
                .toList();

        return new AgentContextBundle(memoryData, domainContext, dataSources);
    }

    public record AgentContextBundle(
            String memoryData,
            String domainContext,
            List<AgentDataSourceDto> dataSources
    ) {
    }
}

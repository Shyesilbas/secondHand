package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentDataSourceDto;
import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class AgentQueryService {

    private final MemoryService memoryService;
    private final List<AgentContextAdapter> contextAdapters;
    private final Executor taskExecutor;

    public AgentQueryService(
            MemoryService memoryService,
            List<AgentContextAdapter> contextAdapters,
            @Qualifier("taskExecutor") Executor taskExecutor
    ) {
        this.memoryService = memoryService;
        this.contextAdapters = contextAdapters;
        this.taskExecutor = taskExecutor;
    }

    public AgentContextBundle buildContext(Long userId, AgentUiContextRequest uiContext) {
        String memoryData = memoryService.buildMemoryData(memoryService.getOrCreate(userId));
        
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

package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentDataSourceDto;
import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentQueryService {

    private final MemoryService memoryService;
    private final List<AgentContextAdapter> contextAdapters;

    public AgentContextBundle buildContext(Long userId, AgentUiContextRequest uiContext) {
        String memoryData = memoryService.buildMemoryData(memoryService.getOrCreate(userId));
        List<AgentContextSection> sections = contextAdapters.stream()
                .map(adapter -> adapter.fetch(userId, uiContext))
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

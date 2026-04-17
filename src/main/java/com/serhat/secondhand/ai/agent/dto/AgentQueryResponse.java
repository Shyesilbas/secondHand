package com.serhat.secondhand.ai.agent.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AgentQueryResponse(
        boolean success,
        boolean agentMode,
        String answer,
        String error,
        LocalDateTime timestamp,
        String model,
        List<AgentDataSourceDto> dataSources,
        List<SuggestedListingDto> suggestedListings
) {
    public static AgentQueryResponse success(String answer, String model, List<AgentDataSourceDto> dataSources) {
        return success(answer, model, dataSources, null);
    }

    public static AgentQueryResponse success(
            String answer,
            String model,
            List<AgentDataSourceDto> dataSources,
            List<SuggestedListingDto> suggestedListings
    ) {
        return new AgentQueryResponse(true, true, answer, null, LocalDateTime.now(), model, dataSources, suggestedListings);
    }

    public static AgentQueryResponse error(String error, List<AgentDataSourceDto> dataSources) {
        return new AgentQueryResponse(false, true, null, error, LocalDateTime.now(), null, dataSources, null);
    }
}

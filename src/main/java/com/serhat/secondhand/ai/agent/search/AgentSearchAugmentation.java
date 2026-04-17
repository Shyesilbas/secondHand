package com.serhat.secondhand.ai.agent.search;

import com.serhat.secondhand.ai.agent.dto.SuggestedListingDto;

import java.util.List;

/**
 * Canlı ilan araması sonucu: prompt bloğu + UI için yapısal liste.
 */
public record AgentSearchAugmentation(
        String liveSearchBlock,
        List<SuggestedListingDto> suggestedListings,
        String dataSourceStatus
) {
    public static AgentSearchAugmentation empty() {
        return new AgentSearchAugmentation("", List.of(), "skipped");
    }

    public static AgentSearchAugmentation rateLimited() {
        return new AgentSearchAugmentation("", List.of(), "rate_limited");
    }
}

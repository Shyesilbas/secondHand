package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.listing.application.common.ListingService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class ListingAgentContextAdapter implements AgentContextAdapter {

    private static final String SOURCE = "listings";
    private static final int MAX_ITEMS = 5;

    private final ListingService listingService;

    @Override
    public AgentContextSection fetch(Long userId, AgentUiContextRequest uiContext) {
        try {
            List<ListingDto> listings = listingService.getMyListings(userId, 0, MAX_ITEMS).getContent();
            if (listings.isEmpty()) {
                return new AgentContextSection(SOURCE, "No active listing snapshots found for this user.", "ok");
            }

            Map<String, Long> statusCounts = listings.stream()
                    .collect(Collectors.groupingBy(
                            l -> l.getStatus() == null ? "UNKNOWN" : l.getStatus().name(),
                            LinkedHashMap::new,
                            Collectors.counting()
                    ));

            String titles = listings.stream()
                    .map(ListingDto::getTitle)
                    .filter(v -> v != null && !v.isBlank())
                    .limit(3)
                    .collect(Collectors.joining(", "));

            String summary = "Recent listing count=" + listings.size()
                    + ", statuses=" + statusCounts
                    + (titles.isBlank() ? "" : ", examples=" + titles);

            return new AgentContextSection(SOURCE, summary, "ok");
        } catch (Exception e) {
            log.warn("Failed to build listing context for user {}: {}", userId, e.getMessage());
            return new AgentContextSection(SOURCE, "Listing data is temporarily unavailable.", "unavailable");
        }
    }
}

package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
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

    private final ListingQueryService listingService;

    @Override
    public AgentContextSection fetch(Long userId, AgentUiContextRequest uiContext) {
        if (userId == null) {
            return new AgentContextSection(SOURCE, "Unauthenticated user.", "skipped");
        }
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

            String items = listings.stream()
                    .limit(MAX_ITEMS)
                    .map(ListingAgentContextAdapter::formatSellerListing)
                    .collect(Collectors.joining("; "));

            String summary = "Recent listing count=" + listings.size()
                    + ", statuses=" + statusCounts
                    + (items.isBlank() ? "" : ", items=[" + items + "]");

            return new AgentContextSection(SOURCE, summary, "ok");
        } catch (Exception e) {
            log.warn("Failed to build listing context for user {}: {}", userId, e.getMessage());
            return new AgentContextSection(SOURCE, "Listing data is temporarily unavailable.", "unavailable");
        }
    }

    private static String formatSellerListing(ListingDto l) {
        String price = l.getPrice() != null ? l.getPrice().toPlainString() : "-";
        String cur = l.getCurrency() != null ? l.getCurrency().name() : "";
        long views = l.getViewCount() != null ? l.getViewCount() : 0L;
        long favs = l.getFavoriteCount() != null ? l.getFavoriteCount() : 0L;
        return "%s(no=%s, type=%s, status=%s, price=%s %s, views=%d, favorites=%d)".formatted(
                l.getTitle() != null ? l.getTitle().trim() : "-",
                l.getListingNo() != null ? l.getListingNo() : "-",
                l.getType() != null ? l.getType().name() : "-",
                l.getStatus() != null ? l.getStatus().name() : "UNKNOWN",
                price,
                cur,
                views,
                favs
        );
    }
}

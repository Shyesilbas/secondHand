package com.serhat.secondhand.chat.enricher;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.Getter;

import java.util.Map;
import java.util.UUID;

@Getter
public class ChatEnrichmentContext {

    private final Map<Long, User> userMap;
    private final Map<Long, Long> unreadCountMap;
    private final Map<UUID, Listing> listingMap;

    public ChatEnrichmentContext(
            Map<Long, User> userMap,
            Map<Long, Long> unreadCountMap,
            Map<UUID, Listing> listingMap
    ) {
        this.userMap = userMap;
        this.unreadCountMap = unreadCountMap;
        this.listingMap = listingMap;
    }

    public User getUser(Long id) {
        return userMap.get(id);
    }

    public Long getUnreadCount(Long roomId) {
        return unreadCountMap.getOrDefault(roomId, 0L);
    }

    public Listing getListing(String listingId) {
        if (listingId == null) {
            return null;
        }
        return listingMap.get(UUID.fromString(listingId));
    }
}

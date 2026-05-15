package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.domain.entity.events.PriceDroppedEvent;
import com.serhat.secondhand.notification.application.INotificationService;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PriceDropNotificationListener {

    private final FavoriteRepository favoriteRepository;
    private final INotificationService notificationService;

    @EventListener
    @Async
    public void handlePriceDroppedEvent(PriceDroppedEvent event) {
        log.info("Handling PriceDroppedEvent for listing: {}", event.getListingId());

        List<User> favoritedUsers = favoriteRepository.findUsersByListingId(event.getListingId());
        
        if (favoritedUsers.isEmpty()) {
            log.info("No users have favorited listing {}, skipping notifications", event.getListingId());
            return;
        }

        String title = "Price Drop Alert!";
        String message = String.format("A favorite item '%s' just dropped in price from %s %s to %s %s!",
                event.getListingTitle(),
                event.getOldPrice().toString(),
                event.getCurrency(),
                event.getNewPrice().toString(),
                event.getCurrency());

        for (User user : favoritedUsers) {
            try {
                // Fixed: Using constructor as builder was missing, and fixed method name
                NotificationRequest request = new NotificationRequest();
                request.setUserId(user.getId());
                request.setType(NotificationType.LISTING_PRICE_DROPPED);
                request.setTitle(title);
                request.setMessage(message);
                request.setMetadata(String.format("{\"listingId\": \"%s\"}", event.getListingId()));
                
                notificationService.createAndSend(request);
                log.debug("Price drop notification sent to user: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send price drop notification to user {}: {}", user.getEmail(), e.getMessage());
            }
        }
        
        log.info("Sent price drop notifications to {} users for listing {}", favoritedUsers.size(), event.getListingId());
    }
}

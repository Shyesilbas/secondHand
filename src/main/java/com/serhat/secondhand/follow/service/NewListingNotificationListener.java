package com.serhat.secondhand.follow.service;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NewListingNotificationListener {

    private final SellerFollowService sellerFollowService;

    @EventListener
    @Async("notificationExecutor")
    public void handleNewListingCreated(NewListingCreatedEvent event) {
        Listing listing = event.getListing();
        log.info("Handling NewListingCreatedEvent for listing: {} by seller: {}", 
            listing.getId(), listing.getSeller().getId());
        
        sellerFollowService.notifyFollowersOfNewListing(listing);
    }
}


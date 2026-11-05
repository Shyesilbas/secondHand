package com.serhat.secondhand.follow.application;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NewListingNotificationListener {

    private final SellerFollowService sellerFollowService;

    // Notify only after the publishing transaction commits; run immediately when there is no transaction.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Async("notificationExecutor")
    public void handleNewListingCreated(NewListingCreatedEvent event) {
        Listing listing = event.getListing();
        log.info("Handling NewListingCreatedEvent for listing: {} by seller: {}", 
            listing.getId(), listing.getSeller().getId());
        
        sellerFollowService.notifyFollowersOfNewListing(listing);
    }
}

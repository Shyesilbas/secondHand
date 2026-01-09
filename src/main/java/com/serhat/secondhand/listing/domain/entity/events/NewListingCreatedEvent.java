package com.serhat.secondhand.listing.domain.entity.events;

import com.serhat.secondhand.listing.domain.entity.Listing;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NewListingCreatedEvent extends ApplicationEvent {
    
    private final Listing listing;
    
    public NewListingCreatedEvent(Object source, Listing listing) {
        super(source);
        this.listing = listing;
    }
}


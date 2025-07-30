package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IListingService {
    
    Optional<Listing> findById(UUID id);
    List<Listing> findByStatus(ListingStatus status);
    
    void publish(UUID listingId);
    void close(UUID listingId);
    void markAsSold(UUID listingId);
    void deactivate(UUID listingId);
    
    void validateOwnership(UUID listingId, User currentUser);
    void validateStatus(Listing listing, ListingStatus... allowedStatuses);
} 
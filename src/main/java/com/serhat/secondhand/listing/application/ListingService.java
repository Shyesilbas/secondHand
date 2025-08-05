package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.ListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService implements IListingService {
    
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    
    @Override
    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }
    
    @Override
    public List<Listing> findByStatus(ListingStatus status) {
        return listingRepository.findByStatus(status);
    }

    @Override
    public List<ListingDto> getMyListings(User user) {
        log.info("Getting all listings for user: {}", user.getEmail());
        List<Listing> listings = listingRepository.findBySellerOrderByCreatedAtDesc(user);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }

    @Override
    public List<ListingDto> getMyListingsByStatus(User user, ListingStatus status) {
        log.info("Getting listings for user: {} with status: {}", user.getEmail(), status);
        List<Listing> listings = listingRepository.findBySellerAndStatus(user, status);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }

    @Override
    public List<ListingDto> findByStatusAsDto(ListingStatus status) {
        log.info("Getting all listings with status: {}", status);
        List<Listing> listings = listingRepository.findByStatus(status);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }
    
    @Override
    @Transactional
    public void publish(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        validateStatus(listing, ListingStatus.DRAFT);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
        log.info("Listing published: {}", listingId);
    }
    
    @Override
    @Transactional
    public void close(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        listing.setStatus(ListingStatus.CLOSED);
        listingRepository.save(listing);
        log.info("Listing closed: {}", listingId);
    }
    
    @Override
    @Transactional
    public void markAsSold(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        listing.setStatus(ListingStatus.SOLD);
        listingRepository.save(listing);
        log.info("Listing marked as sold: {}", listingId);
    }
    
    @Override
    @Transactional
    public void deactivate(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        validateStatus(listing, ListingStatus.ACTIVE);
        listing.setStatus(ListingStatus.DRAFT);
        listingRepository.save(listing);
        log.info("Listing deactivated: {}", listingId);
    }
    
    @Override
    public void validateOwnership(UUID listingId, User currentUser) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (!listing.getSeller().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("User is not the owner of this listing");
        }
    }
    
    @Override
    public void validateStatus(Listing listing, ListingStatus... allowedStatuses) {
        for (ListingStatus allowedStatus : allowedStatuses) {
            if (listing.getStatus() == allowedStatus) {
                return;
            }
        }
        throw new IllegalArgumentException("Invalid listing status for this operation");
    }
} 
package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.ListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {
    
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    
    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }
    
    public List<Listing> findByStatus(ListingStatus status) {
        return listingRepository.findByStatus(status);
    }

    public List<ListingDto> getMyListings(User user) {
        log.info("Getting all listings for user: {}", user.getEmail());
        List<Listing> listings = listingRepository.findBySellerOrderByCreatedAtDesc(user);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }

    public List<ListingDto> getMyListingsByStatus(User user, ListingStatus status) {
        log.info("Getting listings for user: {} with status: {}", user.getEmail(), status);
        List<Listing> listings = listingRepository.findBySellerAndStatus(user, status);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }

    public List<ListingDto> findByStatusAsDto(ListingStatus status) {
        log.info("Getting all listings with status: {}", status);
        List<Listing> listings = listingRepository.findByStatus(status);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }
    
    @Transactional
    public void publish(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));

        if (!listing.isListingFeePaid()) {
            throw new BusinessException("Listing creation fee has not been paid.", HttpStatus.BAD_REQUEST, "FEE_NOT_PAID");
        }

        validateStatus(listing, ListingStatus.DRAFT);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
        log.info("Listing published: {}", listingId);
    }
    
    @Transactional
    public void close(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));
        validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        listing.setStatus(ListingStatus.CLOSED);
        listingRepository.save(listing);
        log.info("Listing closed: {}", listingId);
    }
    
    @Transactional
    public void markAsSold(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));
        validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        listing.setStatus(ListingStatus.SOLD);
        listingRepository.save(listing);
        log.info("Listing marked as sold: {}", listingId);
    }
    
    @Transactional
    public void deactivate(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));
        validateStatus(listing, ListingStatus.ACTIVE);
        listing.setStatus(ListingStatus.DRAFT);
        listingRepository.save(listing);
        log.info("Listing deactivated: {}", listingId);
    }
    
    public void validateOwnership(UUID listingId, User currentUser) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));
        if (!listing.getSeller().getId().equals(currentUser.getId())) {
            throw new BusinessException("User is not the owner of this listing", HttpStatus.FORBIDDEN, "NOT_OWNER");
        }
    }
    
    public void validateStatus(Listing listing, ListingStatus... allowedStatuses) {
        for (ListingStatus allowedStatus : allowedStatuses) {
            if (listing.getStatus() == allowedStatus) {
                return;
            }
        }
        throw new BusinessException("Invalid listing status for this operation", HttpStatus.BAD_REQUEST, "INVALID_STATUS");
    }
}

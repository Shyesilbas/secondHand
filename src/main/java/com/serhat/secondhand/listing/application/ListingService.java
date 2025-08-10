package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.ListingDto;
import com.serhat.secondhand.listing.domain.dto.ListingStatisticsDto;
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

    public List<ListingDto> getAllListings() {
        log.info("Getting all active listings");
        return findByStatusAsDto(ListingStatus.ACTIVE);
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
    public void reactivate(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));
        validateStatus(listing, ListingStatus.INACTIVE);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
        log.info("Listing reactivated: {}", listingId);
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
    
    // Statistics Methods
    
    /**
     * Get total count of all listings (regardless of status)
     * @return total listing count
     */
    public long getTotalListingCount() {
        log.info("Getting total listing count");
        return listingRepository.getTotalListingCount();
    }
    
    /**
     * Get count of users who have active listings
     * @return count of users with active listings
     */
    public long getActiveSellerCount() {
        log.info("Getting count of users with active listings");
        return listingRepository.getActiveSellerCount(ListingStatus.ACTIVE);
    }
    
    /**
     * Get count of cities that have active listings
     * @return count of cities with active listings
     */
    public long getActiveCityCount() {
        log.info("Getting count of cities with active listings");
        return listingRepository.getActiveCityCount(ListingStatus.ACTIVE);
    }

    public long getTotalActiveListingCount(){
        return listingRepository.getListingCountByStatus(ListingStatus.ACTIVE);
    }
    

    public ListingStatisticsDto getListingStatistics() {
        log.info("Getting comprehensive listing statistics");
        
        long totalListings = getTotalListingCount();
        long activeListings = getTotalActiveListingCount();
        long activeSellerCount = getActiveSellerCount();
        long activeCityCount = getActiveCityCount();
        
        return ListingStatisticsDto.builder()
                .totalListings(totalListings)
                .activeListings(activeListings)
                .activeSellerCount(activeSellerCount)
                .activeCityCount(activeCityCount)
                .build();
    }

}

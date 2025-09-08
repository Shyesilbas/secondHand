package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Service to access listings without creating circular dependency
 * This service is used by FavoriteService to access listings
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingAccessService {
    
    private final ListingRepository listingRepository;
    
    /**
     * Find listing by ID
     */
    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }
    
    /**
     * Validate if listing is active
     */
    public void validateActive(Listing listing) {
        if (listing == null || !listing.getStatus().equals(ListingStatus.ACTIVE)) {
            throw new BusinessException("Cannot favorite inactive listing", HttpStatus.BAD_REQUEST, "INACTIVE_LISTING");
        }
    }
}

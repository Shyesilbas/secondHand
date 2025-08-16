package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {
    
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final BaseListingFilterService baseListingFilterService;
    private final VehicleListingFilterService vehicleListingFilterService;
    private final ElectronicListingFilterService electronicListingFilterService;
    
    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }

    public Optional<ListingDto> findByListingNo(String listingNo) {
        log.info("Searching for listing with listingNo: {}", listingNo);
        
        if (listingNo == null || listingNo.trim().isEmpty()) {
            log.warn("Empty or null listing number provided");
            return Optional.empty();
        }
        
        String cleanListingNo = listingNo.trim().toUpperCase();
        log.debug("Cleaned listing number: {}", cleanListingNo);
        
        Optional<Listing> listing = listingRepository.findByListingNo(cleanListingNo);
        
        if (listing.isPresent()) {
            log.info("Found listing with listingNo: {} - ID: {}", cleanListingNo, listing.get().getId());
            return Optional.of(listingMapper.toDynamicDto(listing.get()));
        } else {
            log.info("No listing found with listingNo: {}", cleanListingNo);
            return Optional.empty();
        }
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
    
    public List<ListingDto> getListingsByType(ListingType listingType) {
        log.info("Getting all listings with type: {}", listingType);
        List<Listing> listings = listingRepository.findByListingType(listingType);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }
    
    public List<ListingDto> getActiveListingsByType(ListingType listingType) {
        log.info("Getting active listings with type: {}", listingType);
        List<Listing> listings = listingRepository.findByListingTypeAndStatus(listingType, ListingStatus.ACTIVE);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }
    
    public List<ListingDto> getListingsByTypeOrderByDate(ListingType listingType) {
        log.info("Getting listings with type: {} ordered by date", listingType);
        List<Listing> listings = listingRepository.findByListingTypeOrderByCreatedAtDesc(listingType);
        return listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
    }
    
    public Page<ListingDto> getListingsWithFilters(ListingFilterDto filters, ListingType listingType) {
        log.info("Getting listings with filters: {} and type: {}", filters, listingType);
        
        if (filters.getPage() == null) filters.setPage(0);
        if (filters.getSize() == null) filters.setSize(20);
        if (filters.getStatus() == null) filters.setStatus(ListingStatus.ACTIVE);
        
        if (listingType != null) {
            switch (listingType) {
                case VEHICLE:
                    if (filters instanceof VehicleListingFilterDto) {
                        return vehicleListingFilterService.filterVehicles((VehicleListingFilterDto) filters);
                    } else {
                        log.warn("Vehicle listing type requested but non-vehicle filter provided");
                        return baseListingFilterService.filterAllListings(filters);
                    }
                case ELECTRONICS:
                    if (filters instanceof ElectronicListingFilterDto) {
                        return electronicListingFilterService.filterElectronics((ElectronicListingFilterDto) filters);
                    } else {
                        log.warn("Electronics listing type requested but non-electronics filter provided");
                        return baseListingFilterService.filterAllListings(filters);
                    }
                default:
                    log.info("Using base filter service for listing type: {}", listingType);
                    return baseListingFilterService.filterAllListings(filters);
            }
        } else {
            // No specific type requested, use base filter service
            log.info("No listing type specified, using base filter service");
            return baseListingFilterService.filterAllListings(filters);
        }
    }
    
    // Overloaded method for backward compatibility
    public Page<ListingDto> getListingsWithFilters(ListingFilterDto filters) {
        return getListingsWithFilters(filters, null);
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
        listing.setStatus(ListingStatus.INACTIVE);
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
    
    @Transactional
    public void deleteListing(UUID listingId, User currentUser) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));
        if (!listing.getSeller().getId().equals(currentUser.getId())) {
            throw new BusinessException("User is not the owner of this listing", HttpStatus.FORBIDDEN, "NOT_OWNER");
        }
        listingRepository.deleteById(listingId);
        log.info("Listing deleted: {}", listingId);
    }


    public long getTotalListingCount() {
        log.info("Getting total listing count");
        return listingRepository.getTotalListingCount();
    }
    

    public long getActiveSellerCount() {
        log.info("Getting count of users with active listings");
        return listingRepository.getActiveSellerCount(ListingStatus.ACTIVE);
    }
    

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

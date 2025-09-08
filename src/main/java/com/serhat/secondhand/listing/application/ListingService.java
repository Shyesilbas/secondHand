package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.favorite.application.FavoriteStatsService;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {
    
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final VehicleListingFilterService vehicleListingFilterService;
    private final ElectronicListingFilterService electronicListingFilterService;
    private final BooksListingFilterService bookListingFilterService;
    private final ClothingListingFilterService clothingListingFilterService;
    private final RealEstateListingFilterService realEstateListingFilterService;
    private final SportsListingFilterService sportsListingFilterService;
    private final UserService userService;
    private final FavoriteStatsService favoriteStatsService;

    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }

    public Optional<ListingDto> findByIdAsDto(UUID id, String userEmail) {
        return listingRepository.findById(id)
                .map(listing -> {
                    ListingDto dto = listingMapper.toDynamicDto(listing);
                    enrichWithFavoriteStats(dto, userEmail);
                    return dto;
                });
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
            ListingDto dto = listingMapper.toDynamicDto(listing.get());
            enrichWithFavoriteStats(dto, null);
            return Optional.of(dto);
        } else {
            log.info("No listing found with listingNo: {}", cleanListingNo);
            return Optional.empty();
        }
    }

    public List<ListingDto> getMyListings(User user) {
        log.info("Getting all listings for user: {}", user.getEmail());
        List<Listing> listings = listingRepository.findBySellerOrderByCreatedAtDesc(user);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        enrichWithFavoriteStats(dtos, user.getEmail());
        return dtos;
    }
    
    /**
     * Enriches a single listing DTO with favorite statistics
     */
    private void enrichWithFavoriteStats(ListingDto dto, String userEmail) {
        if (dto != null && dto.getId() != null) {
            FavoriteStatsDto stats = favoriteStatsService.getFavoriteStats(dto.getId(), userEmail);
            dto.setFavoriteStats(stats);
        }
    }
    
    /**
     * Enriches a list of listing DTOs with favorite statistics in a batch operation
     */
    private void enrichWithFavoriteStats(List<ListingDto> dtos, String userEmail) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }
        
        List<UUID> listingIds = dtos.stream()
                .map(ListingDto::getId)
                .toList();
                
        Map<UUID, FavoriteStatsDto> statsMap = favoriteStatsService.getFavoriteStatsForListings(listingIds, userEmail);
        
        for (ListingDto dto : dtos) {
            dto.setFavoriteStats(statsMap.getOrDefault(dto.getId(), 
                FavoriteStatsDto.builder()
                    .listingId(dto.getId())
                    .favoriteCount(0L)
                    .isFavorited(false)
                    .build()
            ));
        }
    }

    public Page<ListingDto> filterByCategory(ListingFilterDto filters, String userEmail) {
        Page<ListingDto> result;

        if (filters instanceof VehicleListingFilterDto) {
            log.info("Filtering vehicles");
            result = vehicleListingFilterService.filterVehicles((VehicleListingFilterDto) filters);
        } else if (filters instanceof ElectronicListingFilterDto) {
            log.info("Filtering electronics");
            result = electronicListingFilterService.filterElectronics((ElectronicListingFilterDto) filters);
        } else if (filters instanceof BooksListingFilterDto) {
            log.info("Filtering books");
            result = bookListingFilterService.filterBooks((BooksListingFilterDto) filters);
        } else if (filters instanceof ClothingListingFilterDto) {
            log.info("Filtering clothing");
            result = clothingListingFilterService.filterClothing((ClothingListingFilterDto) filters);
        } else if (filters instanceof RealEstateFilterDto) {
            log.info("Filtering real estate");
            result = realEstateListingFilterService.filterRealEstates((RealEstateFilterDto) filters);
        } else if (filters instanceof SportsListingFilterDto) {
            log.info("Filtering sports");
            result = sportsListingFilterService.filterSports((SportsListingFilterDto) filters);
        } else {
            log.info("Unknown filter type, returning empty page");
            result = Page.empty();
        }

        List<ListingDto> dtos = result.getContent();
        enrichWithFavoriteStats(dtos, userEmail);

        return new PageImpl<>(dtos, result.getPageable(), result.getTotalElements());
    }



    public List<ListingDto> getListingsByUser(Long userId) {
        User user = userService.findById(userId);
        List<Listing> listings = listingRepository.findBySeller(user);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        enrichWithFavoriteStats(dtos, null);
        return dtos;
    }


    public List<ListingDto> getMyListingsByStatus(User user, ListingStatus status) {
        log.info("Getting listings for user: {} with status: {}", user.getEmail(), status);
        List<Listing> listings = listingRepository.findBySellerAndStatus(user, status);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        enrichWithFavoriteStats(dtos, user.getEmail());
        return dtos;
    }

    public List<ListingDto> findByStatusAsDto(ListingStatus status) {
        log.info("Getting all listings with status: {}", status);
        List<Listing> listings = listingRepository.findByStatus(status);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        enrichWithFavoriteStats(dtos, null);
        return dtos;
    }

    public List<ListingDto> getAllListings() {
        log.info("Getting all active listings");
        return findByStatusAsDto(ListingStatus.ACTIVE);
    }
    
    public List<ListingDto> getListingsByType(ListingType listingType) {
        log.info("Getting all listings with type: {}", listingType);
        List<Listing> listings = listingRepository.findByListingType(listingType);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        enrichWithFavoriteStats(dtos, null);
        return dtos;
    }
    
    public List<ListingDto> getActiveListingsByType(ListingType listingType) {
        log.info("Getting active listings with type: {}", listingType);
        List<Listing> listings = listingRepository.findByListingTypeAndStatus(listingType, ListingStatus.ACTIVE);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        enrichWithFavoriteStats(dtos, null);
        return dtos;
    }
    
    public List<ListingDto> getListingsByTypeOrderByDate(ListingType listingType) {
        log.info("Getting listings with type: {} ordered by date", listingType);
        List<Listing> listings = listingRepository.findByListingTypeOrderByCreatedAtDesc(listingType);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        enrichWithFavoriteStats(dtos, null);
        return dtos;
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

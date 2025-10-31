package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.util.ListingFavoriteStatsUtil;
import com.serhat.secondhand.listing.application.util.ListingReviewStatsUtil;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import java.util.HashMap;
import java.util.function.Function;
import java.util.Map;

@Service
@Slf4j
public class ListingService {
    
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final UserService userService;
    private final ListingFavoriteStatsUtil favoriteStatsUtil;
    private final ListingReviewStatsUtil reviewStatsUtil;
    private final Map<Class<?>, Function<ListingFilterDto, Page<ListingDto>>> filterStrategyMap;

    public ListingService(
        ListingRepository listingRepository,
        ListingMapper listingMapper,
        VehicleListingFilterService vehicleListingFilterService,
        ElectronicListingFilterService electronicListingFilterService,
        BooksListingFilterService bookListingFilterService,
        ClothingListingFilterService clothingListingFilterService,
        RealEstateListingFilterService realEstateListingFilterService,
        SportsListingFilterService sportsListingFilterService,
        UserService userService,
        ListingFavoriteStatsUtil favoriteStatsUtil,
        ListingReviewStatsUtil reviewStatsUtil
    ) {
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.userService = userService;
        this.favoriteStatsUtil = favoriteStatsUtil;
        this.reviewStatsUtil = reviewStatsUtil;

        this.filterStrategyMap = new HashMap<>();
        filterStrategyMap.put(VehicleListingFilterDto.class, f -> vehicleListingFilterService.filterVehicles((VehicleListingFilterDto) f));
        filterStrategyMap.put(ElectronicListingFilterDto.class, f -> electronicListingFilterService.filterElectronics((ElectronicListingFilterDto) f));
        filterStrategyMap.put(BooksListingFilterDto.class, f -> bookListingFilterService.filterBooks((BooksListingFilterDto) f));
        filterStrategyMap.put(ClothingListingFilterDto.class, f -> clothingListingFilterService.filterClothing((ClothingListingFilterDto) f));
        filterStrategyMap.put(RealEstateFilterDto.class, f -> realEstateListingFilterService.filterRealEstates((RealEstateFilterDto) f));
        filterStrategyMap.put(SportsListingFilterDto.class, f -> sportsListingFilterService.filterSports((SportsListingFilterDto) f));
    }

    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }

    public Optional<ListingDto> findByIdAsDto(UUID id, String userEmail) {
        return listingRepository.findById(id)
                .map(listing -> {
                    ListingDto dto = listingMapper.toDynamicDto(listing);
                    favoriteStatsUtil.enrichWithFavoriteStats(dto, userEmail);
                    reviewStatsUtil.enrichWithReviewStats(dto);
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
            favoriteStatsUtil.enrichWithFavoriteStats(dto, null);
            reviewStatsUtil.enrichWithReviewStats(dto);
            return Optional.of(dto);
        } else {
            log.info("No listing found with listingNo: {}", cleanListingNo);
            return Optional.empty();
        }
    }

    public Page<ListingDto> filterByCategory(ListingFilterDto filters, String userEmail) {
        Function<ListingFilterDto, Page<ListingDto>> strategy = filterStrategyMap.get(filters.getClass());
        if (strategy == null) {
            log.info("Unknown filter type, returning empty page");
            return Page.empty();
        }
        Page<ListingDto> result = strategy.apply(filters);
        List<ListingDto> dtos = result.getContent();
        favoriteStatsUtil.enrichWithFavoriteStats(dtos, userEmail);
        reviewStatsUtil.enrichWithReviewStats(dtos);
        return new PageImpl<>(dtos, result.getPageable(), result.getTotalElements());
    }

    public Page<ListingDto> globalSearch(String query, int page, int size, String userEmail) {
        log.info("Global search - query: {}, page: {}, size: {}", query, page, size);
        
        if (query == null || query.trim().isEmpty()) {
            return Page.empty();
        }
        
        String searchTerm = query.trim().toLowerCase();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // Search by title and listing number
        Page<Listing> results = listingRepository.findByTitleContainingIgnoreCaseOrListingNoContainingIgnoreCaseAndStatus(
            searchTerm, searchTerm, ListingStatus.ACTIVE, pageable
        );
        
        List<ListingDto> dtos = results.getContent().stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        // Enrich with stats
        favoriteStatsUtil.enrichWithFavoriteStats(dtos, userEmail);
        reviewStatsUtil.enrichWithReviewStats(dtos);
        
        return new PageImpl<>(dtos, pageable, results.getTotalElements());
    }

        private List<ListingDto> getListingsGeneric(List<Listing> listings, String userEmail) {
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        favoriteStatsUtil.enrichWithFavoriteStats(dtos, userEmail);
        reviewStatsUtil.enrichWithReviewStats(dtos);
        return dtos;
    }

    public Page<ListingDto> getMyListings(User user, int page, int size) {
        log.info("Getting listings for user: {} with pagination - page: {}, size: {}", user.getEmail(), page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySeller(user, pageable);
        
        List<ListingDto> dtos = listingsPage.getContent().stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        favoriteStatsUtil.enrichWithFavoriteStats(dtos, user.getEmail());
        reviewStatsUtil.enrichWithReviewStats(dtos);
        
        return new PageImpl<>(dtos, pageable, listingsPage.getTotalElements());
    }

    // Keep the old method for backward compatibility
    public List<ListingDto> getMyListings(User user) {
        log.info("Getting all listings for user: {}", user.getEmail());
        return getListingsGeneric(listingRepository.findBySellerOrderByCreatedAtDesc(user), user.getEmail());
    }


    public List<ListingDto> getListingsByUser(Long userId) {
        User user = userService.findById(userId);
        return getListingsGeneric(listingRepository.findBySeller(user), null);
    }


    public List<ListingDto> getMyListingsByStatus(User user, ListingStatus status) {
        log.info("Getting listings for user: {} with status: {}", user.getEmail(), status);
        return getListingsGeneric(listingRepository.findBySellerAndStatus(user, status), user.getEmail());
    }

    public List<ListingDto> findByStatusAsDto(ListingStatus status) {
        log.info("Getting all listings with status: {}", status);
        return getListingsGeneric(listingRepository.findByStatus(status), null);
    }

    public List<ListingDto> getAllListings() {
        log.info("Getting all active listings");
        return findByStatusAsDto(ListingStatus.ACTIVE);
    }
    
    public List<ListingDto> getListingsByType(ListingType listingType) {
        log.info("Getting all listings with type: {}", listingType);
        return getListingsGeneric(listingRepository.findByListingType(listingType), null);
    }
    
    public List<ListingDto> getActiveListingsByType(ListingType listingType) {
        log.info("Getting active listings with type: {}", listingType);
        return getListingsGeneric(listingRepository.findByListingTypeAndStatus(listingType, ListingStatus.ACTIVE), null);
    }
    
    public List<ListingDto> getListingsByTypeOrderByDate(ListingType listingType) {
        log.info("Getting listings with type: {} ordered by date", listingType);
        return getListingsGeneric(listingRepository.findByListingTypeOrderByCreatedAtDesc(listingType), null);
    }


    @Transactional
    public void publish(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));

        if (!listing.isListingFeePaid()) {
            throw new BusinessException(ListingErrorCodes.LISTING_FEE_NOT_PAID);
        }

        validateStatus(listing, ListingStatus.DRAFT);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
        log.info("Listing published: {}", listingId);
    }
    
    @Transactional
    public void reactivate(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        validateStatus(listing, ListingStatus.INACTIVE);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
        log.info("Listing reactivated: {}", listingId);
    }
    
    @Transactional
    public void markAsSold(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        log.info("markAsSold called for listing {}, but status change is disabled. Keeping status as {}.", listingId, listing.getStatus());
    }
    
    @Transactional
    public void deactivate(UUID listingId) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        validateStatus(listing, ListingStatus.ACTIVE);
        listing.setStatus(ListingStatus.INACTIVE);
        listingRepository.save(listing);
        log.info("Listing deactivated: {}", listingId);
    }


    
    public void validateOwnership(UUID listingId, User currentUser) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        if (!listing.getSeller().getId().equals(currentUser.getId())) {
            throw new BusinessException(ListingErrorCodes.NOT_LISTING_OWNER);
        }
    }
    
    public void validateStatus(Listing listing, ListingStatus... allowedStatuses) {
        for (ListingStatus allowedStatus : allowedStatuses) {
            if (listing.getStatus() == allowedStatus) {
                return;
            }
        }
        throw new BusinessException(ListingErrorCodes.INVALID_LISTING_STATUS);
    }
    
    @Transactional
    public void deleteListing(UUID listingId, User currentUser) {
        Listing listing = findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        if (!listing.getSeller().getId().equals(currentUser.getId())) {
            throw new BusinessException(ListingErrorCodes.NOT_LISTING_OWNER);
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

package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IListingService {
    
    Optional<Listing> findById(UUID id);
    
    Optional<ListingDto> findByIdAsDto(UUID id, Long currentUserId, Long userId);
    
    List<Listing> findAllByIds(List<UUID> ids);
    
    List<ListingDto> findByIds(List<UUID> ids, Long userId);
    
    Page<ListingDto> filterByCategory(ListingFilterDto filters, Long userId);
    
    Page<ListingDto> globalSearch(String query, int page, int size, Long userId);
    
    Page<ListingDto> getMyListings(Long userId, int page, int size);
    
    Page<ListingDto> getMyListings(Long userId, int page, int size, ListingType listingType);
    
    Page<ListingDto> getListingsByUser(Long userId, int page, int size);
    
    Page<ListingDto> getMyListingsByStatus(Long userId, ListingStatus status, int page, int size);
    
    List<ListingDto> findByStatusAsDto(ListingStatus status);
    
    void publish(UUID listingId, Long userId);
    
    void reactivate(UUID listingId, Long userId);
    
    void deactivate(UUID listingId, Long userId);
    
    Result<Void> validateOwnership(UUID listingId, Long userId);
    
    Result<Void> validateStatus(Listing listing, ListingStatus... allowedStatuses);
    
    Result<Void> validateEditableStatus(Listing listing);
    
    Result<Void> applyQuantityUpdate(Listing listing, Optional<Integer> quantity);
    
    void markAsSold(UUID listingId, Long userId);
    
    Result<Void> deleteListing(UUID listingId, Long userId);
    
    BigDecimal calculateTotalListingFee();
}

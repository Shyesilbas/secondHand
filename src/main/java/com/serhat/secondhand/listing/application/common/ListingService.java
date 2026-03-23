package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingStatisticsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@Transactional(readOnly = true)
public class ListingService implements IListingService {

    private final ListingQueryService listingQueryService;
    private final ListingValidationService listingValidationService;
    private final ListingCommandService listingCommandService;
    private final ListingFeeAndStatisticsService listingFeeAndStatisticsService;

    public ListingService(
            ListingQueryService listingQueryService,
            ListingValidationService listingValidationService,
            ListingCommandService listingCommandService,
            ListingFeeAndStatisticsService listingFeeAndStatisticsService
    ) {
        this.listingQueryService = listingQueryService;
        this.listingValidationService = listingValidationService;
        this.listingCommandService = listingCommandService;
        this.listingFeeAndStatisticsService = listingFeeAndStatisticsService;
    }

    @Transactional(readOnly = true)
    public Optional<Listing> findById(UUID id) {
        return listingQueryService.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<ListingDto> findByIdAsDto(UUID id, Long currentUserId, Long userId) {
        return listingQueryService.findByIdAsDto(id, currentUserId, userId);
    }

    @Transactional(readOnly = true)
    public List<Listing> findAllByIds(List<UUID> ids) {
        return listingQueryService.findAllByIds(ids);
    }

    @Transactional(readOnly = true)
    public List<ListingDto> findByIds(List<UUID> ids, Long userId) {
        return listingQueryService.findByIds(ids, userId);
    }

    @Transactional(readOnly = true)
    public Page<ListingDto> filterByCategory(ListingFilterDto filters, Long userId) {
        return listingQueryService.filterByCategory(filters, userId);
    }

    @Transactional(readOnly = true)
    public Page<ListingDto> globalSearch(String query, int page, int size, Long userId) {
        return listingQueryService.globalSearch(query, page, size, userId);
    }

    @Transactional(readOnly = true)
    public Page<ListingDto> getMyListings(Long userId, int page, int size) {
        return listingQueryService.getMyListings(userId, page, size);
    }

    @Transactional(readOnly = true)
    public Page<ListingDto> getMyListings(Long userId, int page, int size, ListingType listingType) {
        return listingQueryService.getMyListings(userId, page, size, listingType);
    }

    @Transactional(readOnly = true)
    public Page<ListingDto> getListingsByUser(Long userId, int page, int size) {
        return listingQueryService.getListingsByUser(userId, page, size);
    }

    @Transactional(readOnly = true)
    public Page<ListingDto> getMyListingsByStatus(Long userId, ListingStatus status, int page, int size) {
        return listingQueryService.getMyListingsByStatus(userId, status, page, size);
    }

    @Transactional(readOnly = true)
    public List<ListingDto> findByStatusAsDto(ListingStatus status) {
        return listingQueryService.findByStatusAsDto(status);
    }

    @Transactional
    public void publish(UUID listingId, Long userId) {
        listingCommandService.publish(listingId, userId);
    }

    @Transactional
    public void reactivate(UUID listingId, Long userId) {
        listingCommandService.reactivate(listingId, userId);
    }

    @Transactional
    public void deactivate(UUID listingId, Long userId) {
        listingCommandService.deactivate(listingId, userId);
    }

    @Transactional(readOnly = true)
    public Result<Void> validateOwnership(UUID listingId, Long userId) {
        return listingValidationService.validateOwnership(listingId, userId);
    }

    public Result<Void> validateStatus(Listing listing, ListingStatus... allowedStatuses) {
        return listingValidationService.validateStatus(listing, allowedStatuses);
    }

    public Result<Void> validateEditableStatus(Listing listing) {
        return listingValidationService.validateEditableStatus(listing);
    }

    public Result<Void> applyQuantityUpdate(Listing listing, Optional<Integer> quantity) {
        return listingValidationService.applyQuantityUpdate(listing, quantity);
    }

    @Transactional
    public void markAsSold(UUID listingId, Long userId) {
        listingCommandService.markAsSold(listingId, userId);
    }

    @Transactional
    public Result<Void> deleteListing(UUID listingId, Long userId) {
        return listingCommandService.deleteListing(listingId, userId);
    }

    @Transactional
    public Result<Void> updateSingleQuantity(UUID listingId, int quantity, Long userId) {
        return listingCommandService.updateSingleQuantity(listingId, quantity, userId);
    }

    @Transactional
    public Result<Void> updateBatchQuantity(List<UUID> listingIds, int quantity, Long userId) {
        return listingCommandService.updateBatchQuantity(listingIds, quantity, userId);
    }

    @Transactional
    public Result<Void> updateSinglePrice(UUID listingId, BigDecimal price, Long userId) {
        return listingCommandService.updateSinglePrice(listingId, price, userId);
    }

    @Transactional
    public Result<Void> updateBatchPrice(List<UUID> listingIds, BigDecimal price, Long userId) {
        return listingCommandService.updateBatchPrice(listingIds, price, userId);
    }

    public BigDecimal calculateTotalListingFee() {
        return listingFeeAndStatisticsService.calculateTotalListingFee();
    }

    @Transactional(readOnly = true)
    public ListingStatisticsDto getGlobalListingStatistics() {
        return listingFeeAndStatisticsService.getGlobalListingStatistics();
    }
}


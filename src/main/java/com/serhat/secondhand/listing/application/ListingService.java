package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.books.BooksListingFilterService;
import com.serhat.secondhand.listing.application.clothing.ClothingListingFilterService;
import com.serhat.secondhand.listing.application.electronic.ElectronicListingFilterService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.enrich.ListingEnrichmentService;
import com.serhat.secondhand.listing.realestate.RealEstateListingFilterService;
import com.serhat.secondhand.listing.sports.SportsListingFilterService;
import com.serhat.secondhand.listing.vehicle.VehicleListingFilterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;
@Service
@Slf4j
@Transactional(readOnly = true)
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService enrichmentService;
    private final ListingConfig listingConfig;
    private final ListingViewService listingViewService;
    private final Map<Class<?>, Function<ListingFilterDto, Page<ListingDto>>> filterStrategyMap;
    private final ApplicationEventPublisher eventPublisher;

    public ListingService(
            ListingRepository listingRepository,
            ListingMapper listingMapper,
            VehicleListingFilterService vehicleListingFilterService,
            ElectronicListingFilterService electronicListingFilterService,
            BooksListingFilterService bookListingFilterService,
            ClothingListingFilterService clothingListingFilterService,
            RealEstateListingFilterService realEstateListingFilterService,
            SportsListingFilterService sportsListingFilterService,
            ListingEnrichmentService enrichmentService,
            ListingViewService listingViewService,
            ListingConfig listingConfig,
            ApplicationEventPublisher eventPublisher
    ) {
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.enrichmentService = enrichmentService;
        this.listingViewService = listingViewService;
        this.listingConfig = listingConfig;
        this.eventPublisher = eventPublisher;

        this.filterStrategyMap = Map.of(
                VehicleListingFilterDto.class, f -> vehicleListingFilterService.filterVehicles((VehicleListingFilterDto) f),
                ElectronicListingFilterDto.class, f -> electronicListingFilterService.filterElectronics((ElectronicListingFilterDto) f),
                BooksListingFilterDto.class, f -> bookListingFilterService.filterBooks((BooksListingFilterDto) f),
                ClothingListingFilterDto.class, f -> clothingListingFilterService.filterClothing((ClothingListingFilterDto) f),
                RealEstateFilterDto.class, f -> realEstateListingFilterService.filterRealEstates((RealEstateFilterDto) f),
                SportsListingFilterDto.class, f -> sportsListingFilterService.filterSports((SportsListingFilterDto) f)
        );
    }

    @Transactional(readOnly = true)
    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<ListingDto> findByIdAsDto(UUID id, Long currentUserId, Long userId) {
        return listingRepository.findByIdWithSeller(id).map(listing -> {
            ListingDto dto = listingMapper.toDynamicDto(listing);

            CompletableFuture<Void> enrichTask = CompletableFuture.runAsync(() ->
                    enrichmentService.enrich(dto, userId));

            if (currentUserId != null && listing.getSeller().getId().equals(currentUserId)) {
                CompletableFuture<ListingViewStatsDto> statsTask = CompletableFuture.supplyAsync(() ->
                        listingViewService.getViewStatistics(id, LocalDateTime.now().minusDays(7), LocalDateTime.now()));

                CompletableFuture.allOf(enrichTask, statsTask).join();
                dto.setViewStats(statsTask.join());
            } else {
                enrichTask.join();
            }

            return dto;
        });
    }

    @Transactional(readOnly = true)
    public List<Listing> findAllByIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return listingRepository.findAllByIdIn(ids);
    }

    @Transactional(readOnly = true)
    public List<ListingDto> findByIds(List<UUID> ids, Long userId) {
        if (ids == null || ids.isEmpty()) return List.of();
        List<Listing> listings = listingRepository.findAllById(ids);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());
        return enrichList(dtos, userId);
    }

    public Page<ListingDto> filterByCategory(ListingFilterDto filters, Long userId) {
        Function<ListingFilterDto, Page<ListingDto>> strategy = filterStrategyMap.get(filters.getClass());
        if (strategy == null) return Page.empty();
        Page<ListingDto> result = strategy.apply(filters);
        return enrichPage(result, userId);
    }

    public Page<ListingDto> globalSearch(String query, int page, int size, Long userId) {
        if (query == null || query.trim().isEmpty()) return Page.empty();

        String searchTerm = query.trim();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Listing> results = listingRepository.findBySearch(
                searchTerm, searchTerm, ListingStatus.ACTIVE, pageable
        );

        List<ListingDto> dtos = results.getContent().stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());

        return new PageImpl<>(enrichmentService.enrich(dtos, userId), pageable, results.getTotalElements());
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySellerId(userId, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size, ListingType listingType) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySellerIdAndListingType(userId, listingType, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> getListingsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySellerId(userId, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> getMyListingsByStatus(Long userId, ListingStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySellerIdAndStatus(userId, status, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public List<ListingDto> findByStatusAsDto(ListingStatus status) {
        return enrichList(
                listingRepository.findByStatus(status)
                        .stream().map(listingMapper::toDynamicDto).toList(),
                null
        );
    }


    @Transactional
    public void publish(UUID listingId, Long userId) {
        Listing listing = findAndValidateOwner(listingId, userId);
        validateStatus(listing, ListingStatus.DRAFT);
        listing.setListingFeePaid(true);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
        eventPublisher.publishEvent(new NewListingCreatedEvent(this, listing));
    }

    @Transactional
    public void reactivate(UUID listingId, Long userId) {
        Listing listing = findAndValidateOwner(listingId, userId);
        validateStatus(listing, ListingStatus.INACTIVE);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
    }

    @Transactional
    public void deactivate(UUID listingId, Long userId) {
        Listing listing = findAndValidateOwner(listingId, userId);
        validateStatus(listing, ListingStatus.ACTIVE);
        listing.setStatus(ListingStatus.INACTIVE);
        listingRepository.save(listing);
    }

    public Result<Void> validateOwnership(UUID listingId, Long userId) {
        return listingRepository.findById(listingId)
                .map(listing -> listing.getSeller().getId().equals(userId)
                        ? Result.<Void>success()
                        : Result.<Void>error(ListingErrorCodes.NOT_LISTING_OWNER))
                .orElse(Result.error(ListingErrorCodes.LISTING_NOT_FOUND));
    }

    public Result<Void> validateStatus(Listing listing, ListingStatus... allowedStatuses) {
        for (ListingStatus allowedStatus : allowedStatuses) {
            if (listing.getStatus() == allowedStatus) return Result.success();
        }
        return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
    }

    public Result<Void> validateEditableStatus(Listing listing) {
        return validateStatus(listing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
    }

    public Result<Void> applyQuantityUpdate(Listing listing, Optional<Integer> quantity) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }
        if (quantity == null || quantity.isEmpty()) {
            return Result.success();
        }
        Integer q = quantity.get();
        if (q == null || q < 1) {
            return Result.error("Quantity must be at least 1", ListingErrorCodes.INVALID_QUANTITY.toString());
        }
        listing.setQuantity(q);
        return Result.success();
    }

    @Transactional
    public void markAsSold(UUID listingId, Long userId) {
        Listing listing = findAndValidateOwner(listingId, userId);
        validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        log.info("Listing with id {} has marked as sold.", listingId);
    }

    @Transactional
    public Result<Void> deleteListing(UUID listingId, Long userId) {
        Result<Void> ownershipResult = validateOwnership(listingId, userId);
        if (ownershipResult.isError()) return ownershipResult;

        listingRepository.deleteById(listingId);
        return Result.success();
    }

    public long getTotalListingCount() {
        return listingRepository.getTotalListingCount();
    }

    public long getActiveSellerCount() {
        return listingRepository.getActiveSellerCount(ListingStatus.ACTIVE);
    }

    public long getActiveCityCount() {
        return listingRepository.getActiveCityCount(ListingStatus.ACTIVE);
    }

    public long getTotalActiveListingCount() {
        return listingRepository.getListingCountByStatus(ListingStatus.ACTIVE);
    }

    public ListingStatisticsDto getListingStatistics() {
        long totalListings = getTotalListingCount();
        long activeListings = getTotalActiveListingCount();
        long activeSellerCount = getActiveSellerCount();
        long activeCityCount = getActiveCityCount();

        long vehicleCount = 0, electronicsCount = 0, realEstateCount = 0, clothingCount = 0, booksCount = 0, sportsCount = 0;
        try {
            var rows = listingRepository.getActiveCountsByType(ListingStatus.ACTIVE);
            for (Object[] row : rows) {
                String key = row[0].toString();
                long count = ((Number) row[1]).longValue();
                switch (key) {
                    case "VEHICLE" -> vehicleCount = count;
                    case "ELECTRONICS" -> electronicsCount = count;
                    case "REAL_ESTATE" -> realEstateCount = count;
                    case "CLOTHING" -> clothingCount = count;
                    case "BOOKS" -> booksCount = count;
                    case "SPORTS" -> sportsCount = count;
                }
            }
        } catch (Exception e) {
            log.error("Failed to retrieve listing counts by type: {}", e.getMessage(), e);
        }

        return ListingStatisticsDto.builder()
                .totalListings(totalListings)
                .activeListings(activeListings)
                .activeSellerCount(activeSellerCount)
                .activeCityCount(activeCityCount)
                .vehicleCount(vehicleCount)
                .electronicsCount(electronicsCount)
                .realEstateCount(realEstateCount)
                .clothingCount(clothingCount)
                .booksCount(booksCount)
                .sportsCount(sportsCount)
                .build();
    }

    // ---------- Private helper methods ----------

    private Listing findAndValidateOwner(UUID listingId, Long userId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        if (!listing.getSeller().getId().equals(userId)) {
            throw new BusinessException(ListingErrorCodes.NOT_LISTING_OWNER);
        }
        return listing;
    }

    private List<ListingDto> enrichList(List<ListingDto> dtos, Long userId) {
        return enrichmentService.enrich(dtos, userId);
    }

    private Page<ListingDto> enrichPage(Page<ListingDto> page, Long userId) {
        return new PageImpl<>(enrichmentService.enrich(page.getContent(), userId), page.getPageable(), page.getTotalElements());
    }

    public BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return fee.add(taxAmount);
    }
}
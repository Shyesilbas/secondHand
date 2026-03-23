package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.application.books.IBooksListingFilterService;
import com.serhat.secondhand.listing.application.clothing.IClothingListingFilterService;
import com.serhat.secondhand.listing.application.electronics.IElectronicListingFilterService;
import com.serhat.secondhand.listing.application.realestate.IRealEstateListingFilterService;
import com.serhat.secondhand.listing.application.sports.ISportsListingFilterService;
import com.serhat.secondhand.listing.application.vehicle.IVehicleListingFilterService;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.review.application.IReviewService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingQueryService {

    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService enrichmentService;
    private final ListingViewService listingViewService;
    private final IReviewService reviewService;
    @Qualifier("taskExecutor")
    private final Executor taskExecutor;

    private final IVehicleListingFilterService vehicleListingFilterService;
    private final IElectronicListingFilterService electronicListingFilterService;
    private final IBooksListingFilterService bookListingFilterService;
    private final IClothingListingFilterService clothingListingFilterService;
    private final IRealEstateListingFilterService realEstateListingFilterService;
    private final ISportsListingFilterService sportsListingFilterService;

    private Map<Class<?>, Function<ListingFilterDto, Page<ListingDto>>> filterStrategyMap;

    @PostConstruct
    void initFilterStrategyMap() {
        this.filterStrategyMap = Map.of(
                VehicleListingFilterDto.class, f -> vehicleListingFilterService.filterVehicles((VehicleListingFilterDto) f),
                ElectronicListingFilterDto.class, f -> electronicListingFilterService.filterElectronics((ElectronicListingFilterDto) f),
                BooksListingFilterDto.class, f -> bookListingFilterService.filterBooks((BooksListingFilterDto) f),
                ClothingListingFilterDto.class, f -> clothingListingFilterService.filterClothing((ClothingListingFilterDto) f),
                RealEstateFilterDto.class, f -> realEstateListingFilterService.filterRealEstates((RealEstateFilterDto) f),
                SportsListingFilterDto.class, f -> sportsListingFilterService.filterSports((SportsListingFilterDto) f)
        );
    }

    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }

    public Optional<ListingDto> findByIdAsDto(UUID id, Long currentUserId, Long userId) {
        return listingRepository.findByIdWithSeller(id).map(listing -> {
            ListingDto dto = listingMapper.toDynamicDto(listing);

            CompletableFuture<Void> enrichTask = CompletableFuture.runAsync(() ->
                    enrichmentService.enrichInPlace(dto, userId), taskExecutor);

            if (currentUserId != null && listing.getSeller().getId().equals(currentUserId)) {
                CompletableFuture<ListingViewStatsDto> statsTask = CompletableFuture.supplyAsync(() ->
                        listingViewService.getViewStatistics(id, LocalDateTime.now().minusDays(ListingBusinessConstants.DEFAULT_VIEW_STATS_WINDOW_DAYS), LocalDateTime.now()), taskExecutor);

                CompletableFuture.allOf(enrichTask, statsTask).join();
                dto.setViewStats(statsTask.join());
            } else {
                enrichTask.join();
            }

            if (dto.getType() != null
                    && !ListingBusinessConstants.LISTING_TYPES_EXCLUDED_FROM_INLINE_REVIEWS.contains(dto.getType())) {
                var reviewsResult = reviewService.getReviewsForListing(id.toString(),
                        PageRequest.of(ListingBusinessConstants.DEFAULT_PAGE_INDEX, ListingBusinessConstants.REVIEWS_PAGE_SIZE));
                if (reviewsResult.isSuccess() && reviewsResult.getData() != null) {
                    dto.setReviews(reviewsResult.getData().getContent());
                }
            }

            return dto;
        });
    }

    public List<Listing> findAllByIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return listingRepository.findAllByIdIn(ids);
    }

    public List<ListingDto> findByIds(List<UUID> ids, Long userId) {
        if (ids == null || ids.isEmpty()) return List.of();
        List<Listing> listings = listingRepository.findByIdsWithSeller(ids);
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
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));

        Page<Listing> results = listingRepository.findBySearch(
                searchTerm, searchTerm, ListingStatus.ACTIVE, pageable
        );

        List<ListingDto> dtos = results.getContent().stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());

        return new PageImpl<>(enrichmentService.enrich(dtos, userId), pageable, results.getTotalElements());
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
        Page<Listing> listingsPage = listingRepository.findBySellerId(userId, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size, ListingType listingType) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
        Page<Listing> listingsPage = listingRepository.findBySellerIdAndListingType(userId, listingType, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> getListingsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
        Page<Listing> listingsPage = listingRepository.findBySellerId(userId, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> getMyListingsByStatus(Long userId, ListingStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
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

    private List<ListingDto> enrichList(List<ListingDto> dtos, Long userId) {
        return enrichmentService.enrich(dtos, userId);
    }

    private Page<ListingDto> enrichPage(Page<ListingDto> page, Long userId) {
        return new PageImpl<>(enrichmentService.enrich(page.getContent(), userId), page.getPageable(), page.getTotalElements());
    }
}


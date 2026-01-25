package com.serhat.secondhand.listing.application;

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
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.enrich.ListingEnrichmentService;
import com.serhat.secondhand.listing.realestate.RealEstateListingFilterService;
import com.serhat.secondhand.listing.sports.SportsListingFilterService;
import com.serhat.secondhand.listing.vehicle.VehicleListingFilterService;
import com.serhat.secondhand.user.application.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional(readOnly = true)
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final UserService userService;
    private final ListingEnrichmentService enrichmentService;
    private final ListingViewService listingViewService;
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
            ListingEnrichmentService enrichmentService,
            ListingViewService listingViewService
    ) {
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.userService = userService;
        this.enrichmentService = enrichmentService;
        this.listingViewService = listingViewService;

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

    public Optional<ListingDto> findByIdAsDto(UUID id, Long currentUserId, String userEmail) {
        return listingRepository.findById(id).map(listing -> {
            ListingDto dto = listingMapper.toDynamicDto(listing);
            dto = enrichmentService.enrich(dto, userEmail);

            // PERFORMANS: Artık DB'ye gitmeden elimizdeki ID'ler ile yetki kontrolü yapıyoruz
            if (currentUserId != null && listing.getSeller().getId().equals(currentUserId)) {
                log.debug("Enriching view stats for listing {} for owner", id);
                LocalDateTime endDate = LocalDateTime.now();
                LocalDateTime startDate = endDate.minusDays(7);
                ListingViewStatsDto viewStats = listingViewService.getViewStatistics(id, startDate, endDate);
                dto.setViewStats(viewStats);
            }
            return dto;
        });
    }

    public Optional<ListingDto> findByListingNo(String listingNo) {
        if (listingNo == null || listingNo.trim().isEmpty()) return Optional.empty();
        return listingRepository.findByListingNo(listingNo.trim().toUpperCase())
                .map(listingMapper::toDynamicDto)
                .map(dto -> enrichmentService.enrich(dto, null));
    }

    public List<ListingDto> findByIds(List<UUID> ids, String userEmail) {
        if (ids == null || ids.isEmpty()) return List.of();
        List<Listing> listings = listingRepository.findAllById(ids);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());
        return enrichList(dtos, userEmail);
    }

    public Page<ListingDto> filterByCategory(ListingFilterDto filters, String userEmail) {
        Function<ListingFilterDto, Page<ListingDto>> strategy = filterStrategyMap.get(filters.getClass());
        if (strategy == null) return Page.empty();
        Page<ListingDto> result = strategy.apply(filters);
        return enrichPage(result, userEmail);
    }

    public Page<ListingDto> globalSearch(String query, int page, int size, String userEmail) {
        if (query == null || query.trim().isEmpty()) return Page.empty();

        String searchTerm = query.trim().toLowerCase();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> results = listingRepository.findByTitleContainingIgnoreCaseOrListingNoContainingIgnoreCaseAndStatus(
                searchTerm, searchTerm, ListingStatus.ACTIVE, pageable
        );

        List<ListingDto> dtos = results.getContent().stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());

        return new PageImpl<>(enrichmentService.enrich(dtos, userEmail), pageable, results.getTotalElements());
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySellerId(userId, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), getUserEmail(userId));
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size, ListingType listingType) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySellerIdAndListingType(userId, listingType, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), getUserEmail(userId));
    }

    public Page<ListingDto> getListingsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listingsPage = listingRepository.findBySellerId(userId, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), getUserEmail(userId));
    }

    public List<ListingDto> getMyListingsByStatus(Long userId, ListingStatus status) {
        return enrichList(
                listingRepository.findBySellerIdAndStatus(userId, status)
                        .stream().map(listingMapper::toDynamicDto).toList(),
                getUserEmail(userId)
        );
    }

    public List<ListingDto> findByStatusAsDto(ListingStatus status) {
        return enrichList(
                listingRepository.findByStatus(status)
                        .stream().map(listingMapper::toDynamicDto).toList(),
                null
        );
    }

    public List<ListingDto> getAllListings() {
        return findByStatusAsDto(ListingStatus.ACTIVE);
    }

    public List<ListingDto> getListingsByType(ListingType listingType) {
        return enrichList(
                listingRepository.findByListingType(listingType)
                        .stream().map(listingMapper::toDynamicDto).toList(),
                null
        );
    }

    public List<ListingDto> getActiveListingsByType(ListingType listingType) {
        return enrichList(
                listingRepository.findByListingTypeAndStatus(listingType, ListingStatus.ACTIVE)
                        .stream().map(listingMapper::toDynamicDto).toList(),
                null
        );
    }

    public List<ListingDto> getListingsByTypeOrderByDate(ListingType listingType) {
        return enrichList(
                listingRepository.findByListingTypeOrderByCreatedAtDesc(listingType)
                        .stream().map(listingMapper::toDynamicDto).toList(),
                null
        );
    }

    @Transactional
    public void publish(UUID listingId, Long userId) {
        Listing listing = findAndValidateOwner(listingId, userId);
        validateStatus(listing, ListingStatus.DRAFT);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
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

    @Transactional
    public void markAsSold(UUID listingId, Long userId) {
        Listing listing = findAndValidateOwner(listingId, userId);
        validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        log.info("markAsSold logic executed for listing {}", listingId);
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
        } catch (Exception ignored) {}

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

    private String getUserEmail(Long userId) {
        var userResult = userService.findById(userId);
        return userResult.isSuccess() ? userResult.getData().getEmail() : null;
    }

    private List<ListingDto> enrichList(List<ListingDto> dtos, String userEmail) {
        return enrichmentService.enrich(dtos, userEmail);
    }

    private Page<ListingDto> enrichPage(Page<ListingDto> page, String userEmail) {
        return new PageImpl<>(enrichmentService.enrich(page.getContent(), userEmail), page.getPageable(), page.getTotalElements());
    }
}
package com.serhat.secondhand.listing.application.query;

import com.serhat.secondhand.listing.application.books.BooksListingService;
import com.serhat.secondhand.listing.application.clothing.ClothingListingService;
import com.serhat.secondhand.listing.application.common.ListingEnrichmentService;
import com.serhat.secondhand.listing.application.electronics.ElectronicListingService;
import com.serhat.secondhand.listing.application.realestate.RealEstateListingService;
import com.serhat.secondhand.listing.application.sports.SportsListingService;
import com.serhat.secondhand.listing.application.vehicle.VehicleListingService;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingSearchService {

    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService enrichmentService;

    @Lazy
    private final BooksListingService booksListingService;
    @Lazy
    private final ClothingListingService clothingListingService;
    @Lazy
    private final ElectronicListingService electronicListingService;
    @Lazy
    private final RealEstateListingService realEstateListingService;
    @Lazy
    private final SportsListingService sportsListingService;
    @Lazy
    private final VehicleListingService vehicleListingService;

    private Map<Class<?>, Function<ListingFilterDto, Page<ListingDto>>> filterStrategyMap;

    @PostConstruct
    void initFilterStrategyMap() {
        this.filterStrategyMap = Map.of(
                VehicleListingFilterDto.class, f -> vehicleListingService.filterVehicles((VehicleListingFilterDto) f),
                ElectronicListingFilterDto.class, f -> electronicListingService.filterElectronics((ElectronicListingFilterDto) f),
                BooksListingFilterDto.class, f -> booksListingService.filterBooks((BooksListingFilterDto) f),
                ClothingListingFilterDto.class, f -> clothingListingService.filterClothing((ClothingListingFilterDto) f),
                RealEstateFilterDto.class, f -> realEstateListingService.filterRealEstate((RealEstateFilterDto) f),
                SportsListingFilterDto.class, f -> sportsListingService.filterSports((SportsListingFilterDto) f)
        );
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

    private Page<ListingDto> enrichPage(Page<ListingDto> page, Long userId) {
        return new PageImpl<>(enrichmentService.enrich(page.getContent(), userId), page.getPageable(), page.getTotalElements());
    }
}

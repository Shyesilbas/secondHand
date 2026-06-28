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
        log.info("ListingSearchService.globalSearch query='{}', page={}, size={}", query, page, size);
        if (query == null || query.trim().isEmpty()) return Page.empty();

        String searchTerm = query.trim().toLowerCase(java.util.Locale.ROOT);
        
        // Clean and tokenize the search term
        String cleaned = searchTerm.replaceAll("[.,;:!?\"'()\\-]", " ");
        String[] queryTokens = cleaned.split("\\s+");
        List<String> stopWords = List.of(
            "var", "mi", "mı", "mu", "mü", "arıyorum", "istiyorum", "bul", "göster", 
            "öner", "lütfen", "bir", "ve", "veya", "en", "en son", "son", "yeni"
        );
        List<String> activeTokens = java.util.Arrays.stream(queryTokens)
                .map(String::trim)
                .filter(t -> t.length() >= 2 && !stopWords.contains(t))
                .map(t -> {
                    if (t.endsWith("sı") || t.endsWith("si") || t.endsWith("su") || t.endsWith("sü")) return t.substring(0, t.length() - 2);
                    if (t.endsWith("lar") || t.endsWith("ler")) return t.substring(0, t.length() - 3);
                    if (t.endsWith("ı") || t.endsWith("i") || t.endsWith("u") || t.endsWith("ü")) return t.substring(0, t.length() - 1);
                    return t;
                })
                .filter(t -> !t.isEmpty())
                .toList();

        log.info("ListingSearchService active search tokens: {}", activeTokens);
        if (activeTokens.isEmpty()) {
            return Page.empty();
        }

        // Fetch all active listings to perform token-based matching in Java
        List<Listing> allActive = listingRepository.findByStatus(ListingStatus.ACTIVE);
        
        List<Listing> matchedListings = allActive.stream()
                .filter(listing -> {
                    String title = (listing.getTitle() == null ? "" : listing.getTitle()).toLowerCase(java.util.Locale.ROOT);
                    String desc = (listing.getDescription() == null ? "" : listing.getDescription()).toLowerCase(java.util.Locale.ROOT);
                    String listingNo = (listing.getListingNo() == null ? "" : listing.getListingNo()).toLowerCase(java.util.Locale.ROOT);
                    
                    // The listing must contain ALL active search tokens in any order
                    return activeTokens.stream().allMatch(token -> 
                        title.contains(token) || desc.contains(token) || listingNo.contains(token)
                    );
                })
                .collect(Collectors.toList());

        log.info("ListingSearchService token-based search found {} matches out of {} active listings", matchedListings.size(), allActive.size());

        // Paginate results
        int start = Math.min(page * size, matchedListings.size());
        int end = Math.min(start + size, matchedListings.size());
        List<Listing> paginated = matchedListings.subList(start, end);

        List<ListingDto> dtos = paginated.stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
        return new PageImpl<>(enrichmentService.enrich(dtos, userId), pageable, matchedListings.size());
    }

    private Page<ListingDto> enrichPage(Page<ListingDto> page, Long userId) {
        return new PageImpl<>(enrichmentService.enrich(page.getContent(), userId), page.getPageable(), page.getTotalElements());
    }
}

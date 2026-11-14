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
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingSearchService {

    private static final char LIKE_ESCAPE_CHAR = '\\';
    private static final Set<String> STOP_WORDS = Set.of(
            "var", "mi", "mı", "mu", "mü", "arıyorum", "istiyorum", "bul", "göster",
            "öner", "lütfen", "bir", "ve", "veya", "en", "en son", "son", "yeni"
    );

    private final EntityManager entityManager;
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService enrichmentService;
    private final com.serhat.secondhand.user.application.UserBlockService userBlockService;

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
        filters.setExcludedSellerIds(userBlockService.getMutuallyHiddenUserIds(userId));
        Page<ListingDto> result = strategy.apply(filters);
        return enrichPage(result, userId);
    }

    public Page<ListingDto> globalSearch(String query, int page, int size, Long userId) {
        int safePage = Math.max(0, page);
        int safeSize = normalizePageSize(size);
        log.debug("ListingSearchService.globalSearch query='{}', page={}, size={}", query, safePage, safeSize);
        if (query == null || query.trim().isEmpty()) return emptySearchPage(safePage, safeSize);

        List<String> activeTokens = tokenizeSearchQuery(query);
        log.debug("ListingSearchService active search tokens: {}", activeTokens);
        if (activeTokens.isEmpty()) {
            return emptySearchPage(safePage, safeSize);
        }

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Direction.DESC,
                        ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT,
                        ListingBusinessConstants.LISTING_SORT_PROPERTY_ID
                )
        );

        Set<Long> hiddenSellerIds = userBlockService.getMutuallyHiddenUserIds(userId);

        forceCustomPlanForThisTransaction();

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Listing> dataQuery = cb.createQuery(Listing.class);
        Root<Listing> dataRoot = dataQuery.from(Listing.class);
        dataRoot.fetch("seller", JoinType.LEFT);

        List<Predicate> dataPredicates = buildSearchPredicates(cb, dataRoot, activeTokens, hiddenSellerIds);
        dataQuery.select(dataRoot)
                .where(dataPredicates.toArray(new Predicate[0]))
                .orderBy(
                        cb.desc(dataRoot.get(ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT)),
                        cb.desc(dataRoot.get(ListingBusinessConstants.LISTING_SORT_PROPERTY_ID))
                );

        TypedQuery<Listing> typedQuery = entityManager.createQuery(dataQuery);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        List<Listing> paginated = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Listing> countRoot = countQuery.from(Listing.class);
        List<Predicate> countPredicates = buildSearchPredicates(cb, countRoot, activeTokens, hiddenSellerIds);
        countQuery.select(cb.count(countRoot))
                .where(countPredicates.toArray(new Predicate[0]));
        long totalMatches = entityManager.createQuery(countQuery).getSingleResult();

        log.debug("ListingSearchService DB token search returned {} page items out of {} total matches",
                paginated.size(), totalMatches);

        List<ListingDto> dtos = paginated.stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());

        return new PageImpl<>(enrichmentService.enrich(dtos, userId), pageable, totalMatches);
    }

    // After a few executions of the same server-side prepared statement PostgreSQL may switch to a
    // generic plan that ignores the LIKE pattern, skips the trigram indexes and scans every active
    // listing in created_at order (~0.9 s for a rare term at 200k listings vs ~10 ms with a custom plan).
    // is_local = true limits the setting to the current transaction.
    private void forceCustomPlanForThisTransaction() {
        entityManager.createNativeQuery("SELECT set_config('plan_cache_mode', 'force_custom_plan', true)")
                .getSingleResult();
    }

    static List<String> tokenizeSearchQuery(String query) {
        String trimmed = query.trim();
        if (trimmed.length() > ListingBusinessConstants.MAX_GLOBAL_SEARCH_QUERY_LENGTH) {
            trimmed = trimmed.substring(0, ListingBusinessConstants.MAX_GLOBAL_SEARCH_QUERY_LENGTH);
        }
        // Locale.ROOT lowercases "İ" to "i" + U+0307 (combining dot); PostgreSQL lower() yields a plain "i".
        String searchTerm = trimmed.toLowerCase(Locale.ROOT).replace("̇", "");
        String cleaned = searchTerm.replaceAll("[.,;:!?\"'()\\-]", " ");
        String[] queryTokens = cleaned.split("\\s+");

        return Arrays.stream(queryTokens)
                .map(String::trim)
                .filter(t -> t.length() >= ListingBusinessConstants.MIN_GLOBAL_SEARCH_TOKEN_LENGTH && !STOP_WORDS.contains(t))
                .map(t -> {
                    if (t.endsWith("sı") || t.endsWith("si") || t.endsWith("su") || t.endsWith("sü")) return t.substring(0, t.length() - 2);
                    if (t.endsWith("lar") || t.endsWith("ler")) return t.substring(0, t.length() - 3);
                    if (t.endsWith("ı") || t.endsWith("i") || t.endsWith("u") || t.endsWith("ü")) return t.substring(0, t.length() - 1);
                    return t;
                })
                .filter(t -> t.length() >= ListingBusinessConstants.MIN_GLOBAL_SEARCH_TOKEN_LENGTH)
                .distinct()
                .limit(ListingBusinessConstants.MAX_GLOBAL_SEARCH_TOKENS)
                .toList();
    }

    private static List<Predicate> buildSearchPredicates(CriteriaBuilder cb, Root<Listing> root, List<String> tokens,
                                                     Set<Long> hiddenSellerIds) {
        List<Predicate> predicates = new ArrayList<>(tokens.size() + 1);
        predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));
        if (!hiddenSellerIds.isEmpty()) {
            predicates.add(cb.not(root.get("seller").get("id").in(hiddenSellerIds)));
        }

        for (String token : tokens) {
            String pattern = "%" + escapeLikeWildcards(token) + "%";
            Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern, LIKE_ESCAPE_CHAR);
            Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern, LIKE_ESCAPE_CHAR);
            Predicate listingNoMatch = cb.like(cb.lower(root.get("listingNo")), pattern, LIKE_ESCAPE_CHAR);
            predicates.add(cb.or(titleMatch, descMatch, listingNoMatch));
        }
        return predicates;
    }

    private static String escapeLikeWildcards(String token) {
        StringBuilder sb = new StringBuilder(token.length());
        for (int i = 0; i < token.length(); i++) {
            char c = token.charAt(i);
            if (c == '%' || c == '_' || c == LIKE_ESCAPE_CHAR) {
                sb.append(LIKE_ESCAPE_CHAR);
            }
            sb.append(c);
        }
        return sb.toString();
    }

    private static int normalizePageSize(int size) {
        if (size < 1) {
            return ListingBusinessConstants.DEFAULT_GLOBAL_SEARCH_PAGE_SIZE;
        }
        return Math.min(size, ListingBusinessConstants.MAX_GLOBAL_SEARCH_PAGE_SIZE);
    }

    // Page.empty() is unpaged and Jackson cannot serialize Unpaged (getOffset throws), so the
    // empty result carries the requested page like a normal search result.
    private static Page<ListingDto> emptySearchPage(int page, int size) {
        return Page.empty(PageRequest.of(page, size,
                Sort.by(
                        Sort.Direction.DESC,
                        ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT,
                        ListingBusinessConstants.LISTING_SORT_PROPERTY_ID
                )));
    }

    private Page<ListingDto> enrichPage(Page<ListingDto> page, Long userId) {
        return new PageImpl<>(enrichmentService.enrich(page.getContent(), userId), page.getPageable(), page.getTotalElements());
    }
}

package com.serhat.secondhand.listing.application.query;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.listing.application.books.BooksListingService;
import com.serhat.secondhand.listing.application.clothing.ClothingListingService;
import com.serhat.secondhand.listing.application.common.ListingEnrichmentService;
import com.serhat.secondhand.listing.application.electronics.ElectronicListingService;
import com.serhat.secondhand.listing.application.realestate.RealEstateListingService;
import com.serhat.secondhand.listing.application.sports.SportsListingService;
import com.serhat.secondhand.listing.application.vehicle.VehicleListingService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Page;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyChar;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ListingSearchServiceEmptyResultTest {

    private final EntityManager entityManager = mock(EntityManager.class);
    private final ListingMapper listingMapper = mock(ListingMapper.class);
    private final ListingEnrichmentService enrichmentService = mock(ListingEnrichmentService.class);
    private final com.serhat.secondhand.user.application.UserBlockService userBlockService =
            mock(com.serhat.secondhand.user.application.UserBlockService.class);

    private final ListingSearchService service = new ListingSearchService(
            entityManager,
            listingMapper,
            enrichmentService,
            userBlockService,
            mock(BooksListingService.class),
            mock(ClothingListingService.class),
            mock(ElectronicListingService.class),
            mock(RealEstateListingService.class),
            mock(SportsListingService.class),
            mock(VehicleListingService.class));

    // "a" and "x y" are single letters, "yeni" and "en son" are stop words, " " is blank.
    @ParameterizedTest
    @ValueSource(strings = { "a", "x y", "yeni", "en son", " " })
    void queryWithoutUsableTokenReturnsSerializablePagedEmptyPage(String query) {
        Page<ListingDto> result = service.globalSearch(query, 2, 8, null);

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getPageable().isPaged()).isTrue();
        assertThat(result.getNumber()).isEqualTo(2);
        assertThat(result.getSize()).isEqualTo(8);
        assertThatCode(() -> new ObjectMapper().findAndRegisterModules().writeValueAsString(result))
                .doesNotThrowAnyException();
        verifyNoInteractions(entityManager);
    }

    @Test
    @SuppressWarnings({ "unchecked", "rawtypes" })
    void globalSearchExecutesDatabasePagedQueryOrderedByCreatedAtDescWithBounds() {
        CriteriaBuilder cb = mock(CriteriaBuilder.class);
        CriteriaQuery<Listing> dataQuery = mock(CriteriaQuery.class);
        CriteriaQuery<Long> countQuery = mock(CriteriaQuery.class);
        Root<Listing> dataRoot = mock(Root.class);
        Root<Listing> countRoot = mock(Root.class);
        TypedQuery<Listing> typedDataQuery = mock(TypedQuery.class);
        TypedQuery<Long> typedCountQuery = mock(TypedQuery.class);
        Path statusPath = mock(Path.class);
        Path createdAtPath = mock(Path.class);
        Path idPath = mock(Path.class);
        Path stringPath = mock(Path.class);
        Expression<String> lowerExpr = mock(Expression.class);
        Predicate predicate = mock(Predicate.class);
        Order createdAtDescOrder = mock(Order.class);
        Order idDescOrder = mock(Order.class);

        Query planModeQuery = mock(Query.class);
        when(entityManager.createNativeQuery("SELECT set_config('plan_cache_mode', 'force_custom_plan', true)"))
                .thenReturn(planModeQuery);
        when(entityManager.getCriteriaBuilder()).thenReturn(cb);
        when(cb.createQuery(Listing.class)).thenReturn(dataQuery);
        when(cb.createQuery(Long.class)).thenReturn(countQuery);
        when(dataQuery.from(Listing.class)).thenReturn(dataRoot);
        when(countQuery.from(Listing.class)).thenReturn(countRoot);

        when(dataRoot.get("status")).thenReturn(statusPath);
        when(countRoot.get("status")).thenReturn(statusPath);
        when(dataRoot.get(ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT)).thenReturn(createdAtPath);
        when(dataRoot.get(ListingBusinessConstants.LISTING_SORT_PROPERTY_ID)).thenReturn(idPath);
        when(dataRoot.get("title")).thenReturn(stringPath);
        when(dataRoot.get("description")).thenReturn(stringPath);
        when(dataRoot.get("listingNo")).thenReturn(stringPath);
        when(countRoot.get("title")).thenReturn(stringPath);
        when(countRoot.get("description")).thenReturn(stringPath);
        when(countRoot.get("listingNo")).thenReturn(stringPath);

        when(cb.equal(any(), eq(ListingStatus.ACTIVE))).thenReturn(predicate);
        when(cb.lower(any())).thenReturn(lowerExpr);
        when(cb.like(eq(lowerExpr), anyString(), anyChar())).thenReturn(predicate);
        when(cb.or(any(Predicate.class), any(Predicate.class), any(Predicate.class))).thenReturn(predicate);
        when(cb.desc(createdAtPath)).thenReturn(createdAtDescOrder);
        when(cb.desc(idPath)).thenReturn(idDescOrder);
        when(cb.count(countRoot)).thenReturn(mock(Expression.class));

        when(dataQuery.select(dataRoot)).thenReturn(dataQuery);
        when(dataQuery.where(any(Predicate[].class))).thenReturn(dataQuery);
        when(dataQuery.orderBy(createdAtDescOrder, idDescOrder)).thenReturn(dataQuery);

        when(countQuery.select(any())).thenReturn(countQuery);
        when(countQuery.where(any(Predicate[].class))).thenReturn(countQuery);

        when(entityManager.createQuery(dataQuery)).thenReturn(typedDataQuery);
        when(entityManager.createQuery(countQuery)).thenReturn(typedCountQuery);

        Listing listing = new Listing();
        ListingDto dto = mock(ListingDto.class);
        when(typedDataQuery.getResultList()).thenReturn(List.of(listing));
        when(typedCountQuery.getSingleResult()).thenReturn(1L);
        when(listingMapper.toDynamicDto(listing)).thenReturn(dto);
        when(enrichmentService.enrich(List.of(dto), 42L)).thenReturn(List.of(dto));

        // Negative page and oversized page size should be clamped
        Page<ListingDto> result = service.globalSearch("macbook pro", -3, 500, 42L);

        assertThat(result.getNumber()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(ListingBusinessConstants.MAX_GLOBAL_SEARCH_PAGE_SIZE);
        assertThat(result.getTotalElements()).isEqualTo(1L);
        assertThat(result.getContent()).containsExactly(dto);

        verify(planModeQuery).getSingleResult();
        verify(dataRoot).fetch("seller", JoinType.LEFT);
        verify(dataQuery).orderBy(createdAtDescOrder, idDescOrder);
        verify(typedDataQuery).setFirstResult(0);
        verify(typedDataQuery).setMaxResults(ListingBusinessConstants.MAX_GLOBAL_SEARCH_PAGE_SIZE);
    }

    @Test
    void tokenizeSearchQueryLimitsTokensKeepsTwoLetterWordsAndStripsTurkishSuffixes() {
        List<String> tokens = ListingSearchService.tokenizeSearchQuery(
                "a tv telefonlar bilgisayarlar arabası evler kitaplar saatler masalar koltuklar dolaplar lambalar");

        assertThat(tokens).hasSize(ListingBusinessConstants.MAX_GLOBAL_SEARCH_TOKENS);
        // Two-letter words ("tv", "ev" from "evler") are kept; single letters are dropped.
        assertThat(tokens).containsExactly("tv", "telefon", "bilgisayar", "araba", "ev", "kitap", "saat", "masa");
    }

    @Test
    void tokenizeSearchQueryLowercasesTurkishDottedCapitalIToPlainI() {
        // Must match PostgreSQL lower('İ') = 'i', not Java's "i" + combining dot.
        assertThat(ListingSearchService.tokenizeSearchQuery("İphone İSTANBUL"))
                .containsExactly("iphone", "istanbul");
    }
}

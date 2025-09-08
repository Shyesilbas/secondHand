package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BooksListingFilterServiceImpl implements BooksListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ListingMapper listingMapper;

    @Override
    public Page<ListingDto> filterBooks(BooksListingFilterDto filters) {
        log.info("Filtering books with criteria: {}", filters);

        Pageable pageable = FilterHelper.initializeFilter(filters);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<BooksListing> query = cb.createQuery(BooksListing.class);
        Root<BooksListing> root = query.from(BooksListing.class);

        List<Predicate> predicates = buildPredicates(cb, root, filters);

        query.select(root)
                .where(predicates.toArray(new Predicate[0]))
                .orderBy(buildOrderBy(cb, root, filters));

        TypedQuery<BooksListing> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<BooksListing> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<BooksListing> countRoot = countQuery.from(BooksListing.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, filters);
        countQuery.select(cb.count(countRoot)).where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ListingDto> dtos = results.stream().map(listingMapper::toDynamicDto).toList();

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<BooksListing> root,
                                            BooksListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

        predicates.addAll(FilterHelper.buildBasePredicates(cb, root, filters));

        if (filters.getGenres() != null && !filters.getGenres().isEmpty()) {
            predicates.add(root.get("genre").in(filters.getGenres()));
        }
        if (filters.getLanguages() != null && !filters.getLanguages().isEmpty()) {
            predicates.add(root.get("language").in(filters.getLanguages()));
        }
        if (filters.getFormats() != null && !filters.getFormats().isEmpty()) {
            predicates.add(root.get("format").in(filters.getFormats()));
        }
        if (filters.getConditions() != null && !filters.getConditions().isEmpty()) {
            predicates.add(root.get("condition").in(filters.getConditions()));
        }
        if (filters.getMinYear() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("publicationYear"), filters.getMinYear()));
        }
        if (filters.getMaxYear() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("publicationYear"), filters.getMaxYear()));
        }
        if (filters.getMinPageCount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("pageCount"), filters.getMinPageCount()));
        }
        if (filters.getMaxPageCount() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("pageCount"), filters.getMaxPageCount()));
        }

        return predicates;
    }

    private List<Order> buildOrderBy(CriteriaBuilder cb, Root<BooksListing> root,
                                     BooksListingFilterDto filters) {
        List<Order> orders = new ArrayList<>();
        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy().toLowerCase();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());
            Expression<?> sortExpression = switch (sortBy) {
                case "price" -> root.get("price");
                case "createdat", "created_at" -> root.get("createdAt");
                case "year", "publicationyear", "publication_year" -> root.get("publicationYear");
                case "pagecount", "page_count" -> root.get("pageCount");
                case "author" -> root.get("author");
                default -> root.get("createdAt");
            };
            orders.add(isDesc ? cb.desc(sortExpression) : cb.asc(sortExpression));
        } else {
            orders.add(cb.desc(root.get("createdAt")));
        }
        return orders;
    }
}



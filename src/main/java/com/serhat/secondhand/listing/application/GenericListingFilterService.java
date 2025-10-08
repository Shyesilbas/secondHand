package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
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
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GenericListingFilterService<T extends Listing, F extends ListingFilterDto> {

    @PersistenceContext
    private EntityManager entityManager;
    
    private final ListingMapper listingMapper;

    public Page<ListingDto> filter(F filters, Class<T> entityClass, FilterPredicateBuilder<T, F> predicateBuilder) {
        log.info("Filtering {} with criteria: {}", entityClass.getSimpleName(), filters);
        
        Pageable pageable = FilterHelper.initializeFilter(filters);
        
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        
        CriteriaQuery<T> query = cb.createQuery(entityClass);
        Root<T> root = query.from(entityClass);
        
        List<Predicate> predicates = buildAllPredicates(cb, root, filters, predicateBuilder);
        
        query.select(root)
                .where(predicates.toArray(new Predicate[0]))
                .orderBy(buildOrderBy(cb, root, filters, predicateBuilder));
        
        TypedQuery<T> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        
        List<T> results = typedQuery.getResultList();
        
        Long total = executeCountQuery(cb, entityClass, filters, predicateBuilder);
        
        List<ListingDto> dtos = results.stream()
                .map(listingMapper::toDynamicDto)
                .toList();
        
        return new PageImpl<>(dtos, pageable, total);
    }
    
    private List<Predicate> buildAllPredicates(CriteriaBuilder cb, Root<T> root, F filters, 
                                             FilterPredicateBuilder<T, F> predicateBuilder) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Base predicates (common for all listings)
        predicates.addAll(FilterHelper.buildBasePredicates(cb, root, filters));
        
        // Category-specific predicates
        predicates.addAll(predicateBuilder.buildSpecificPredicates(cb, root, filters));
        
        return predicates;
    }
    
    private List<Order> buildOrderBy(CriteriaBuilder cb, Root<T> root, F filters,
                                   FilterPredicateBuilder<T, F> predicateBuilder) {
        List<Order> orders = new ArrayList<>();
        
        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy().toLowerCase();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());
            
            Expression<?> sortExpression = predicateBuilder.getSortExpression(root, sortBy)
                    .orElse(root.get("createdAt"));
            
            orders.add(isDesc ? cb.desc(sortExpression) : cb.asc(sortExpression));
        } else {
            orders.add(cb.desc(root.get("createdAt")));
        }
        
        return orders;
    }
    
    private Long executeCountQuery(CriteriaBuilder cb, Class<T> entityClass, F filters,
                                 FilterPredicateBuilder<T, F> predicateBuilder) {
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<T> countRoot = countQuery.from(entityClass);
        
        List<Predicate> countPredicates = buildAllPredicates(cb, countRoot, filters, predicateBuilder);
        
        countQuery.select(cb.count(countRoot))
                .where(countPredicates.toArray(new Predicate[0]));
        
        return entityManager.createQuery(countQuery).getSingleResult();
    }
}

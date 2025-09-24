package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
public class BaseListingFilterServiceImpl implements BaseListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;
    
    private final ListingMapper listingMapper;

    @Override
    public Page<ListingDto> filterAllListings(ListingFilterDto filters) {
        log.info("Filtering all listings with criteria: {}", filters);
        
        Pageable pageable = FilterHelper.initializeFilter(filters);
        
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Listing> query = cb.createQuery(Listing.class);
        Root<Listing> listing = query.from(Listing.class);

        List<Predicate> predicates = new ArrayList<>();

                if (filters.getListingType() != null) {
            predicates.add(cb.equal(listing.get("listingType"), filters.getListingType()));
        }

                predicates.addAll(FilterHelper.buildBasePredicates(cb, listing, filters));

                if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }

                if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());

            Expression<?> sortExpression;
            if (sortBy.equalsIgnoreCase("price")) {
                sortExpression = listing.get("price");
            } else {
                sortExpression = listing.get("createdAt");
            }

            if (isDesc) {
                query.orderBy(cb.desc(sortExpression));
            } else {
                query.orderBy(cb.asc(sortExpression));
            }
        } else {
                        query.orderBy(cb.desc(listing.get("createdAt")));
        }

                List<Listing> results = entityManager.createQuery(query)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

                CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Listing> countRoot = countQuery.from(Listing.class);
        countQuery.select(cb.count(countRoot));

                if (!predicates.isEmpty()) {
            countQuery.where(predicates.toArray(new Predicate[0]));
        }

        Long total = entityManager.createQuery(countQuery).getSingleResult();

                List<ListingDto> dtos = results.stream()
                .map(listingMapper::toDynamicDto)
                .toList();

        return new PageImpl<>(dtos, pageable, total);
    }
}

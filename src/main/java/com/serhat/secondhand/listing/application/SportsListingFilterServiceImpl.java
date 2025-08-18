package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
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
public class SportsListingFilterServiceImpl implements SportsListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ListingMapper listingMapper;

    @Override
    public Page<ListingDto> filterSports(SportsListingFilterDto filters) {
        log.info("Filtering sports with criteria: {}", filters);

        Pageable pageable = FilterHelper.initializeFilter(filters);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<SportsListing> query = cb.createQuery(SportsListing.class);
        Root<SportsListing> root = query.from(SportsListing.class);

        List<Predicate> predicates = buildPredicates(cb, root, filters);

        query.select(root)
                .where(predicates.toArray(new Predicate[0]))
                .orderBy(cb.desc(root.get("createdAt")));

        TypedQuery<SportsListing> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<SportsListing> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<SportsListing> countRoot = countQuery.from(SportsListing.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, filters);
        countQuery.select(cb.count(countRoot)).where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ListingDto> dtos = results.stream().map(listingMapper::toDynamicDto).toList();
        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<SportsListing> root,
                                            SportsListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.addAll(FilterHelper.buildBasePredicates(cb, root, filters));
        if (filters.getDisciplines() != null && !filters.getDisciplines().isEmpty()) {
            predicates.add(root.get("discipline").in(filters.getDisciplines()));
        }
        if (filters.getEquipmentTypes() != null && !filters.getEquipmentTypes().isEmpty()) {
            predicates.add(root.get("equipmentType").in(filters.getEquipmentTypes()));
        }
        if (filters.getConditions() != null && !filters.getConditions().isEmpty()) {
            predicates.add(root.get("condition").in(filters.getConditions()));
        }
        return predicates;
    }
}



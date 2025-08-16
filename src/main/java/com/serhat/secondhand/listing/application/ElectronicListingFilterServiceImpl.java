package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElectronicListingFilterServiceImpl implements ElectronicListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ListingMapper listingMapper;

    @Override
    public Page<ListingDto> filterElectronics(ElectronicListingFilterDto filters) {
        log.info("Filtering electronics with criteria: {}", filters);

        Pageable pageable = FilterHelper.initializeFilter(filters);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // Query for results - Use ElectronicListing directly since it extends Listing
        CriteriaQuery<ElectronicListing> query = cb.createQuery(ElectronicListing.class);
        Root<ElectronicListing> root = query.from(ElectronicListing.class);

        List<Predicate> predicates = buildPredicates(cb, root, filters);

        query.select(root)
                .where(predicates.toArray(new Predicate[0]))
                .orderBy(buildOrderBy(cb, root, filters));

        TypedQuery<ElectronicListing> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<ElectronicListing> results = typedQuery.getResultList();

        // Count query for total
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<ElectronicListing> countRoot = countQuery.from(ElectronicListing.class);

        List<Predicate> countPredicates = buildPredicates(cb, countRoot, filters);

        countQuery.select(cb.count(countRoot))
                .where(countPredicates.toArray(new Predicate[0]));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        // Convert to DTOs
        List<ListingDto> dtos = results.stream()
                .map(listingMapper::toDynamicDto)
                .toList();

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<ElectronicListing> root,
                                            ElectronicListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();


        predicates.add(cb.equal(root.get("listingType"), ListingType.ELECTRONICS));

        // Add base predicates from helper
        predicates.addAll(FilterHelper.buildBasePredicates(cb, root, filters));

        // Electronics-specific filters - directly accessible since root is ElectronicListing
        if (filters.getElectronicTypes() != null && !filters.getElectronicTypes().isEmpty()) {
            predicates.add(root.get("electronicType").in(filters.getElectronicTypes()));
        }

        if (filters.getElectronicBrands() != null && !filters.getElectronicBrands().isEmpty()) {
            predicates.add(root.get("electronicBrand").in(filters.getElectronicBrands()));
        }

        if (filters.getColors() != null && !filters.getColors().isEmpty()) {
            predicates.add(root.get("color").in(filters.getColors()));
        }

        // Year range for electronics
        if (filters.getMinYear() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filters.getMinYear()));
        }

        if (filters.getMaxYear() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("year"), filters.getMaxYear()));
        }

        return predicates;
    }

    private List<Order> buildOrderBy(CriteriaBuilder cb, Root<ElectronicListing> root,
                                     ElectronicListingFilterDto filters) {
        List<Order> orders = new ArrayList<>();

        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy().toLowerCase();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());

            Expression<?> sortExpression = switch (sortBy) {
                case "price" -> root.get("price");
                case "year" -> root.get("year");
                case "brand" -> root.get("electronicBrand");
                case "type" -> root.get("electronicType");
                case "model" -> root.get("model");
                default -> root.get("createdAt");
            };

            orders.add(isDesc ? cb.desc(sortExpression) : cb.asc(sortExpression));
        } else {
            orders.add(cb.desc(root.get("createdAt")));
        }

        return orders;
    }
}
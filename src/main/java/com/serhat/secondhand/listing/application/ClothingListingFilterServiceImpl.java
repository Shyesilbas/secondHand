package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
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
public class ClothingListingFilterServiceImpl implements ClothingListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ListingMapper listingMapper;

    @Override
    public Page<ListingDto> filterClothing(ClothingListingFilterDto filters) {
        log.info("Filtering clothing listings with criteria: {}", filters);
        
        Pageable pageable = FilterHelper.initializeFilter(filters);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // Query for results - Use ClothingListing directly since it extends Listing
        CriteriaQuery<ClothingListing> query = cb.createQuery(ClothingListing.class);
        Root<ClothingListing> root = query.from(ClothingListing.class);

        List<Predicate> predicates = buildPredicates(cb, root, filters);

        query.select(root)
                .where(predicates.toArray(new Predicate[0]))
                .orderBy(buildOrderBy(cb, root, filters));

        TypedQuery<ClothingListing> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<ClothingListing> results = typedQuery.getResultList();
        
        log.info("Found {} clothing listings", results.size());
        if (!results.isEmpty()) {
            log.info("First clothing listing: {}", results.get(0));
        }

        // Count query for total
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<ClothingListing> countRoot = countQuery.from(ClothingListing.class);

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

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<ClothingListing> root,
                                            ClothingListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

        // Add base predicates from helper
        predicates.addAll(FilterHelper.buildBasePredicates(cb, root, filters));

        // Clothing-specific filters - directly accessible since root is ClothingListing
        if (filters.getBrands() != null && !filters.getBrands().isEmpty()) {
            predicates.add(root.get("brand").in(filters.getBrands()));
        }

        if (filters.getTypes() != null && !filters.getTypes().isEmpty()) {
            predicates.add(root.get("clothingType").in(filters.getTypes()));
        }

        if (filters.getColors() != null && !filters.getColors().isEmpty()) {
            predicates.add(root.get("color").in(filters.getColors()));
        }

        if (filters.getConditions() != null && !filters.getConditions().isEmpty()) {
            predicates.add(root.get("condition").in(filters.getConditions()));
        }

        // Purchase date range
        if (filters.getMinPurchaseDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), filters.getMinPurchaseDate()));
        }

        if (filters.getMaxPurchaseDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), filters.getMaxPurchaseDate()));
        }

        return predicates;
    }

    private List<Order> buildOrderBy(CriteriaBuilder cb, Root<ClothingListing> root,
                                     ClothingListingFilterDto filters) {
        List<Order> orders = new ArrayList<>();

        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy().toLowerCase();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());

            Expression<?> sortExpression = switch (sortBy) {
                case "price" -> root.get("price");
                case "createdat", "created_at" -> root.get("createdAt");
                case "brand" -> root.get("brand");
                case "type" -> root.get("clothingType");
                case "condition" -> root.get("condition");
                case "purchasedate", "purchase_date" -> root.get("purchaseDate");
                default -> root.get("createdAt");
            };

            orders.add(isDesc ? cb.desc(sortExpression) : cb.asc(sortExpression));
        } else {
            // Default sorting by creation date descending
            orders.add(cb.desc(root.get("createdAt")));
        }

        return orders;
    }
}

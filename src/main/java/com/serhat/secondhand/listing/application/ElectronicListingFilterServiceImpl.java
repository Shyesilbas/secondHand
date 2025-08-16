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

        if (filters.getPage() == null) filters.setPage(0);
        if (filters.getSize() == null) filters.setSize(20);
        if (filters.getStatus() == null) filters.setStatus(ListingStatus.ACTIVE);

        Pageable pageable = PageRequest.of(filters.getPage(), filters.getSize());

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
                .map(listing -> listingMapper.toDynamicDto(listing))
                .toList();

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<ElectronicListing> root,
                                            ElectronicListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

        // Listing type is automatically filtered since we're using ElectronicListing entity
        // But we can add it explicitly for safety
        predicates.add(cb.equal(root.get("listingType"), ListingType.ELECTRONICS));

        // Basic filters from parent Listing class
        if (filters.getStatus() != null) {
            predicates.add(cb.equal(root.get("status"), filters.getStatus()));
        }

        if (filters.getCity() != null && !filters.getCity().trim().isEmpty()) {
            predicates.add(cb.like(
                    cb.lower(root.get("city")),
                    "%" + filters.getCity().toLowerCase() + "%"
            ));
        }

        if (filters.getDistrict() != null && !filters.getDistrict().trim().isEmpty()) {
            predicates.add(cb.like(
                    cb.lower(root.get("district")),
                    "%" + filters.getDistrict().toLowerCase() + "%"
            ));
        }

        // Price range
        if (filters.getMinPrice() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filters.getMinPrice()));
        }

        if (filters.getMaxPrice() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("price"), filters.getMaxPrice()));
        }

        // Currency
        if (filters.getCurrency() != null) {
            predicates.add(cb.equal(root.get("currency"), filters.getCurrency()));
        }

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

            Expression<?> sortExpression;
            switch (sortBy) {
                case "price":
                    sortExpression = root.get("price");
                    break;
                case "createdat":
                case "created_at":
                    sortExpression = root.get("createdAt");
                    break;
                case "year":
                    sortExpression = root.get("year");
                    break;
                case "brand":
                    sortExpression = root.get("electronicBrand");
                    break;
                case "type":
                    sortExpression = root.get("electronicType");
                    break;
                case "model":
                    sortExpression = root.get("model");
                    break;
                default:
                    sortExpression = root.get("createdAt");
            }

            orders.add(isDesc ? cb.desc(sortExpression) : cb.asc(sortExpression));
        } else {
            orders.add(cb.desc(root.get("createdAt")));
        }

        return orders;
    }
}
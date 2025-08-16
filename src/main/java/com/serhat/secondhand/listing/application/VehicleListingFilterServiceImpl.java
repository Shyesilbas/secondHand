package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
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
public class VehicleListingFilterServiceImpl implements VehicleListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ListingMapper listingMapper;

        @Override
    public Page<ListingDto> filterVehicles(VehicleListingFilterDto filters) {
        log.info("Filtering vehicles with criteria: {}", filters);
        
        Pageable pageable = FilterHelper.initializeFilter(filters);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // Query for results - Use VehicleListing directly since it extends Listing
        CriteriaQuery<VehicleListing> query = cb.createQuery(VehicleListing.class);
        Root<VehicleListing> root = query.from(VehicleListing.class);

        List<Predicate> predicates = buildPredicates(cb, root, filters);

        query.select(root)
                .where(predicates.toArray(new Predicate[0]))
                .orderBy(buildOrderBy(cb, root, filters));

        TypedQuery<VehicleListing> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<VehicleListing> results = typedQuery.getResultList();

        // Count query for total
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<VehicleListing> countRoot = countQuery.from(VehicleListing.class);

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

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<VehicleListing> root,
                                            VehicleListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();


        predicates.add(cb.equal(root.get("listingType"), ListingType.VEHICLE));

        // Add base predicates from helper
        predicates.addAll(FilterHelper.buildBasePredicates(cb, root, filters));

        // Vehicle-specific filters - directly accessible since root is VehicleListing
        if (filters.getBrands() != null && !filters.getBrands().isEmpty()) {
            predicates.add(root.get("brand").in(filters.getBrands()));
        }

        if (filters.getFuelTypes() != null && !filters.getFuelTypes().isEmpty()) {
            predicates.add(root.get("fuelType").in(filters.getFuelTypes()));
        }

        if (filters.getColors() != null && !filters.getColors().isEmpty()) {
            predicates.add(root.get("color").in(filters.getColors()));
        }

        if (filters.getGearTypes() != null && !filters.getGearTypes().isEmpty()) {
            predicates.add(root.get("gearType").in(filters.getGearTypes()));
        }

        if (filters.getSeatCounts() != null && !filters.getSeatCounts().isEmpty()) {
            predicates.add(root.get("seatCount").in(filters.getSeatCounts()));
        }

        if (filters.getDoors() != null) {
            predicates.add(cb.equal(root.get("doors"), filters.getDoors()));
        }

        // Year range for vehicles
        if (filters.getMinYear() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filters.getMinYear()));
        }

        if (filters.getMaxYear() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("year"), filters.getMaxYear()));
        }

        // Mileage filter
        if (filters.getMaxMileage() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("mileage"), filters.getMaxMileage()));
        }

        return predicates;
    }

    private List<Order> buildOrderBy(CriteriaBuilder cb, Root<VehicleListing> root,
                                     VehicleListingFilterDto filters) {
        List<Order> orders = new ArrayList<>();

        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy().toLowerCase();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());

            Expression<?> sortExpression = switch (sortBy) {
                case "price" -> root.get("price");
                case "createdat", "created_at" -> root.get("createdAt");
                case "year" -> root.get("year");
                case "mileage" -> root.get("mileage");
                case "brand" -> root.get("brand");
                case "doors" -> root.get("doors");
                case "fueltype", "fuel_type" -> root.get("fuelType");
                case "geartype", "gear_type" -> root.get("gearType");
                case "model" -> root.get("model");
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
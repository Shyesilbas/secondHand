package com.serhat.secondhand.listing.domain.repository;

import com.serhat.secondhand.listing.domain.dto.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ListingRepositoryImpl implements ListingRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Listing> findWithFilters(ListingFilterDto filters, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Listing> query = cb.createQuery(Listing.class);
        Root<Listing> listing = query.from(Listing.class);

        List<Predicate> predicates = new ArrayList<>();

        // Basic filters
        if (filters.getListingType() != null) {
            predicates.add(cb.equal(listing.get("listingType"), filters.getListingType()));
        }

        if (filters.getStatus() != null) {
            predicates.add(cb.equal(listing.get("status"), filters.getStatus()));
        }

        if (filters.getCity() != null && !filters.getCity().trim().isEmpty()) {
            predicates.add(cb.like(cb.lower(listing.get("city")), 
                "%" + filters.getCity().toLowerCase() + "%"));
        }

        if (filters.getDistrict() != null && !filters.getDistrict().trim().isEmpty()) {
            predicates.add(cb.like(cb.lower(listing.get("district")), 
                "%" + filters.getDistrict().toLowerCase() + "%"));
        }

        // Price filters
        if (filters.getMinPrice() != null) {
            predicates.add(cb.greaterThanOrEqualTo(listing.get("price"), filters.getMinPrice()));
        }

        if (filters.getMaxPrice() != null) {
            predicates.add(cb.lessThanOrEqualTo(listing.get("price"), filters.getMaxPrice()));
        }

        if (filters.getCurrency() != null) {
            predicates.add(cb.equal(listing.get("currency"), filters.getCurrency()));
        }

        // Vehicle specific filters using subquery
        if (hasVehicleFilters(filters)) {
            Subquery<VehicleListing> vehicleSubquery = query.subquery(VehicleListing.class);
            Root<VehicleListing> vehicleRoot = vehicleSubquery.from(VehicleListing.class);
            vehicleSubquery.select(vehicleRoot);

            List<Predicate> vehiclePredicates = new ArrayList<>();
            vehiclePredicates.add(cb.equal(vehicleRoot.get("id"), listing.get("id")));

            if (filters.getBrands() != null && !filters.getBrands().isEmpty()) {
                vehiclePredicates.add(vehicleRoot.get("brand").in(filters.getBrands()));
            }

            if (filters.getMinYear() != null) {
                vehiclePredicates.add(cb.greaterThanOrEqualTo(vehicleRoot.get("year"), filters.getMinYear()));
            }

            if (filters.getMaxYear() != null) {
                vehiclePredicates.add(cb.lessThanOrEqualTo(vehicleRoot.get("year"), filters.getMaxYear()));
            }

            if (filters.getMaxMileage() != null) {
                vehiclePredicates.add(cb.lessThanOrEqualTo(vehicleRoot.get("mileage"), filters.getMaxMileage()));
            }

            if (filters.getFuelTypes() != null && !filters.getFuelTypes().isEmpty()) {
                vehiclePredicates.add(vehicleRoot.get("fuelType").in(filters.getFuelTypes()));
            }

            if (filters.getColors() != null && !filters.getColors().isEmpty()) {
                vehiclePredicates.add(vehicleRoot.get("color").in(filters.getColors()));
            }

            if (filters.getDoors() != null) {
                vehiclePredicates.add(cb.equal(vehicleRoot.get("doors"), filters.getDoors()));
            }

            vehicleSubquery.where(vehiclePredicates.toArray(new Predicate[0]));
            predicates.add(cb.exists(vehicleSubquery));
        }

        // Apply all predicates
        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }

        // Sorting - for vehicle-specific sorting, use subqueries too
        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());

            Expression<?> sortExpression;
            switch (sortBy.toLowerCase()) {
                case "price":
                    sortExpression = listing.get("price");
                    break;
                case "createdat":
                case "created_at":
                    sortExpression = listing.get("createdAt");
                    break;
                case "year":
                case "mileage":
                    // For vehicle-specific sorting, we'll stick to basic sorting for now
                    // Complex subquery sorting would be too expensive
                    sortExpression = listing.get("createdAt");
                    break;
                default:
                    sortExpression = listing.get("createdAt");
            }

            if (isDesc) {
                query.orderBy(cb.desc(sortExpression));
            } else {
                query.orderBy(cb.asc(sortExpression));
            }
        } else {
            // Default sorting by creation date descending
            query.orderBy(cb.desc(listing.get("createdAt")));
        }

        // Execute query
        List<Listing> results = entityManager.createQuery(query)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        // Count query for pagination
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Listing> countRoot = countQuery.from(Listing.class);
        countQuery.select(cb.count(countRoot));

        // Apply same predicates to count query
        List<Predicate> countPredicates = new ArrayList<>();
        if (filters.getListingType() != null) {
            countPredicates.add(cb.equal(countRoot.get("listingType"), filters.getListingType()));
        }
        if (filters.getStatus() != null) {
            countPredicates.add(cb.equal(countRoot.get("status"), filters.getStatus()));
        }
        if (filters.getCity() != null && !filters.getCity().trim().isEmpty()) {
            countPredicates.add(cb.like(cb.lower(countRoot.get("city")), 
                "%" + filters.getCity().toLowerCase() + "%"));
        }
        if (filters.getDistrict() != null && !filters.getDistrict().trim().isEmpty()) {
            countPredicates.add(cb.like(cb.lower(countRoot.get("district")), 
                "%" + filters.getDistrict().toLowerCase() + "%"));
        }
        if (filters.getMinPrice() != null) {
            countPredicates.add(cb.greaterThanOrEqualTo(countRoot.get("price"), filters.getMinPrice()));
        }
        if (filters.getMaxPrice() != null) {
            countPredicates.add(cb.lessThanOrEqualTo(countRoot.get("price"), filters.getMaxPrice()));
        }
        if (filters.getCurrency() != null) {
            countPredicates.add(cb.equal(countRoot.get("currency"), filters.getCurrency()));
        }

        // Vehicle filters for count query
        if (hasVehicleFilters(filters)) {
            Subquery<VehicleListing> countVehicleSubquery = countQuery.subquery(VehicleListing.class);
            Root<VehicleListing> countVehicleRoot = countVehicleSubquery.from(VehicleListing.class);
            countVehicleSubquery.select(countVehicleRoot);

            List<Predicate> countVehiclePredicates = new ArrayList<>();
            countVehiclePredicates.add(cb.equal(countVehicleRoot.get("id"), countRoot.get("id")));

            if (filters.getBrands() != null && !filters.getBrands().isEmpty()) {
                countVehiclePredicates.add(countVehicleRoot.get("brand").in(filters.getBrands()));
            }
            if (filters.getMinYear() != null) {
                countVehiclePredicates.add(cb.greaterThanOrEqualTo(countVehicleRoot.get("year"), filters.getMinYear()));
            }
            if (filters.getMaxYear() != null) {
                countVehiclePredicates.add(cb.lessThanOrEqualTo(countVehicleRoot.get("year"), filters.getMaxYear()));
            }
            if (filters.getMaxMileage() != null) {
                countVehiclePredicates.add(cb.lessThanOrEqualTo(countVehicleRoot.get("mileage"), filters.getMaxMileage()));
            }
            if (filters.getFuelTypes() != null && !filters.getFuelTypes().isEmpty()) {
                countVehiclePredicates.add(countVehicleRoot.get("fuelType").in(filters.getFuelTypes()));
            }
            if (filters.getColors() != null && !filters.getColors().isEmpty()) {
                countVehiclePredicates.add(countVehicleRoot.get("color").in(filters.getColors()));
            }
            if (filters.getDoors() != null) {
                countVehiclePredicates.add(cb.equal(countVehicleRoot.get("doors"), filters.getDoors()));
            }

            countVehicleSubquery.where(countVehiclePredicates.toArray(new Predicate[0]));
            countPredicates.add(cb.exists(countVehicleSubquery));
        }

        if (!countPredicates.isEmpty()) {
            countQuery.where(countPredicates.toArray(new Predicate[0]));
        }

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(results, pageable, total);
    }

    private boolean hasVehicleFilters(ListingFilterDto filters) {
        return (filters.getBrands() != null && !filters.getBrands().isEmpty()) ||
               filters.getMinYear() != null ||
               filters.getMaxYear() != null ||
               filters.getMaxMileage() != null ||
               (filters.getFuelTypes() != null && !filters.getFuelTypes().isEmpty()) ||
               (filters.getColors() != null && !filters.getColors().isEmpty()) ||
               filters.getDoors() != null;
    }
}
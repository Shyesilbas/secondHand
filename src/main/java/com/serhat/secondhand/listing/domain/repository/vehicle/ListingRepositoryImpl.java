package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
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

            if (filters.getGearTypes() != null && !filters.getGearTypes().isEmpty()) {
                vehiclePredicates.add(vehicleRoot.get("gearbox").in(filters.getGearTypes()));
            }

            if (filters.getSeatCounts() != null && !filters.getSeatCounts().isEmpty()) {
                vehiclePredicates.add(vehicleRoot.get("seatCount").in(filters.getSeatCounts()));
            }

            vehicleSubquery.where(vehiclePredicates.toArray(new Predicate[0]));
            predicates.add(cb.exists(vehicleSubquery));
        }

        // Electronics specific filters using subquery (generic approach similar to vehicle)
        if (hasElectronicFilters(filters)) {
            Subquery<ElectronicListing> elSub = query.subquery(ElectronicListing.class);
            Root<ElectronicListing> elRoot = elSub.from(ElectronicListing.class);
            elSub.select(elRoot);

            List<Predicate> elPreds = new ArrayList<>();
            elPreds.add(cb.equal(elRoot.get("id"), listing.get("id")));
            if (filters.getElectronicTypes() != null && !filters.getElectronicTypes().isEmpty()) {
                elPreds.add(elRoot.get("electronicType").in(filters.getElectronicTypes()));
            }
            if (filters.getElectronicBrands() != null && !filters.getElectronicBrands().isEmpty()) {
                elPreds.add(elRoot.get("electronicBrand").in(filters.getElectronicBrands()));
            }
            if (filters.getMinYear() != null) {
                elPreds.add(cb.greaterThanOrEqualTo(elRoot.get("year"), filters.getMinYear()));
            }
            if (filters.getMaxYear() != null) {
                elPreds.add(cb.lessThanOrEqualTo(elRoot.get("year"), filters.getMaxYear()));
            }
            if (filters.getColors() != null && !filters.getColors().isEmpty()) {
                elPreds.add(elRoot.get("color").in(filters.getColors()));
            }
            elSub.where(elPreds.toArray(new Predicate[0]));
            predicates.add(cb.exists(elSub));
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
            if (filters.getGearTypes() != null && !filters.getGearTypes().isEmpty()) {
                countVehiclePredicates.add(countVehicleRoot.get("gearbox").in(filters.getGearTypes()));
            }
            if (filters.getSeatCounts() != null && !filters.getSeatCounts().isEmpty()) {
                countVehiclePredicates.add(countVehicleRoot.get("seatCount").in(filters.getSeatCounts()));
            }

            countVehicleSubquery.where(countVehiclePredicates.toArray(new Predicate[0]));
            countPredicates.add(cb.exists(countVehicleSubquery));
        }

        // Electronics filters for count query
        if (hasElectronicFilters(filters)) {
            Subquery<ElectronicListing> countElSub = countQuery.subquery(ElectronicListing.class);
            Root<ElectronicListing> countElRoot = countElSub.from(ElectronicListing.class);
            countElSub.select(countElRoot);

            List<Predicate> countElPreds = new ArrayList<>();
            countElPreds.add(cb.equal(countElRoot.get("id"), countRoot.get("id")));
            if (filters.getElectronicTypes() != null && !filters.getElectronicTypes().isEmpty()) {
                countElPreds.add(countElRoot.get("electronicType").in(filters.getElectronicTypes()));
            }
            if (filters.getElectronicBrands() != null && !filters.getElectronicBrands().isEmpty()) {
                countElPreds.add(countElRoot.get("electronicBrand").in(filters.getElectronicBrands()));
            }
            if (filters.getMinYear() != null) {
                countElPreds.add(cb.greaterThanOrEqualTo(countElRoot.get("year"), filters.getMinYear()));
            }
            if (filters.getMaxYear() != null) {
                countElPreds.add(cb.lessThanOrEqualTo(countElRoot.get("year"), filters.getMaxYear()));
            }
            if (filters.getColors() != null && !filters.getColors().isEmpty()) {
                countElPreds.add(countElRoot.get("color").in(filters.getColors()));
            }
            countElSub.where(countElPreds.toArray(new Predicate[0]));
            countPredicates.add(cb.exists(countElSub));
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
               filters.getDoors() != null ||
               (filters.getGearTypes() != null && !filters.getGearTypes().isEmpty()) ||
               (filters.getSeatCounts() != null && !filters.getSeatCounts().isEmpty());
    }

    private boolean hasElectronicFilters(ListingFilterDto filters) {
        return (filters.getElectronicTypes() != null && !filters.getElectronicTypes().isEmpty()) ||
               (filters.getElectronicBrands() != null && !filters.getElectronicBrands().isEmpty()) ||
               filters.getMinYear() != null ||
               filters.getMaxYear() != null ||
               (filters.getColors() != null && !filters.getColors().isEmpty());
    }
}
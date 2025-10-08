package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class VehicleFilterPredicateBuilder implements FilterPredicateBuilder<VehicleListing, VehicleListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<VehicleListing> root, VehicleListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        predicates.add(cb.equal(root.get("listingType"), ListingType.VEHICLE));
        
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
        
        if (filters.getMinYear() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filters.getMinYear()));
        }
        
        if (filters.getMaxYear() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("year"), filters.getMaxYear()));
        }
        
        if (filters.getMaxMileage() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("mileage"), filters.getMaxMileage()));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<VehicleListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "year" -> Optional.of(root.get("year"));
            case "mileage" -> Optional.of(root.get("mileage"));
            case "brand" -> Optional.of(root.get("brand"));
            case "doors" -> Optional.of(root.get("doors"));
            case "fueltype", "fuel_type" -> Optional.of(root.get("fuelType"));
            case "geartype", "gear_type" -> Optional.of(root.get("gearType"));
            case "model" -> Optional.of(root.get("model"));
            default -> Optional.empty();
        };
    }
}

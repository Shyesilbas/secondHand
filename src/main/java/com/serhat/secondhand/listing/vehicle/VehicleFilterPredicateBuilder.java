package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.listing.application.FilterPredicateBuilder;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.JoinType;
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

        if (filters.getVehicleTypeIds() != null && !filters.getVehicleTypeIds().isEmpty()) {
            predicates.add(root.join("vehicleType").get("id").in(filters.getVehicleTypeIds()));
        }
        
        if (filters.getBrandIds() != null && !filters.getBrandIds().isEmpty()) {
            predicates.add(root.join("brand").get("id").in(filters.getBrandIds()));
        }

        if (filters.getVehicleModelIds() != null && !filters.getVehicleModelIds().isEmpty()) {
            predicates.add(root.join("model").get("id").in(filters.getVehicleModelIds()));
        }

        if (filters.getFuelTypes() != null && !filters.getFuelTypes().isEmpty()) {
            predicates.add(root.get("fuelType").in(filters.getFuelTypes()));
        }
        
        if (filters.getColors() != null && !filters.getColors().isEmpty()) {
            predicates.add(root.get("color").in(filters.getColors()));
        }
        
        if (filters.getGearTypes() != null && !filters.getGearTypes().isEmpty()) {
            predicates.add(root.get("gearbox").in(filters.getGearTypes()));
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
        
        if (filters.getDrivetrains() != null && !filters.getDrivetrains().isEmpty()) {
            predicates.add(root.get("drivetrain").in(filters.getDrivetrains()));
        }

        if (filters.getBodyTypes() != null && !filters.getBodyTypes().isEmpty()) {
            predicates.add(root.get("bodyType").in(filters.getBodyTypes()));
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
            case "brand" -> Optional.of(root.join("brand", JoinType.LEFT).get("label"));
            case "doors" -> Optional.of(root.get("doors"));
            case "fueltype", "fuel_type" -> Optional.of(root.get("fuelType"));
            case "geartype", "gear_type" -> Optional.of(root.get("gearbox"));
            case "model" -> Optional.of(root.join("model", JoinType.LEFT).get("name"));
            default -> Optional.empty();
        };
    }
}

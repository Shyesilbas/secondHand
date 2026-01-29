package com.serhat.secondhand.listing.realestate;

import com.serhat.secondhand.listing.application.FilterPredicateBuilder;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class RealEstateFilterPredicateBuilder implements FilterPredicateBuilder<RealEstateListing, RealEstateFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<RealEstateListing> root, RealEstateFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Listing type constraint
        predicates.add(cb.equal(root.get("listingType"), ListingType.REAL_ESTATE));
        
        // RealEstate-specific filters
        if (filters.getHeatingTypeIds() != null && !filters.getHeatingTypeIds().isEmpty()) {
            predicates.add(root.join("heatingType", JoinType.LEFT).get("id").in(filters.getHeatingTypeIds()));
        }
        
        if (filters.getRealEstateTypeIds() != null && !filters.getRealEstateTypeIds().isEmpty()) {
            predicates.add(root.join("realEstateType", JoinType.LEFT).get("id").in(filters.getRealEstateTypeIds()));
        }
        
        if (filters.getFloor() != null) {
            predicates.add(cb.equal(root.get("floor"), filters.getFloor()));
        }
        
        if (filters.getAdTypeId() != null) {
            predicates.add(cb.equal(root.join("adType", JoinType.LEFT).get("id"), filters.getAdTypeId()));
        }
        
        if (filters.getOwnerTypeId() != null) {
            predicates.add(cb.equal(root.join("ownerType", JoinType.LEFT).get("id"), filters.getOwnerTypeId()));
        }
        
        // Range filters
        if (filters.getMinSquareMeters() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("squareMeters"), filters.getMinSquareMeters()));
        }
        if (filters.getMaxSquareMeters() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("squareMeters"), filters.getMaxSquareMeters()));
        }
        
        if (filters.getMinRoomCount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("roomCount"), filters.getMinRoomCount()));
        }
        if (filters.getMaxRoomCount() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("roomCount"), filters.getMaxRoomCount()));
        }
        
        if (filters.getMinBathroomCount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("bathroomCount"), filters.getMinBathroomCount()));
        }
        if (filters.getMaxBathroomCount() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("bathroomCount"), filters.getMaxBathroomCount()));
        }
        
        if (filters.getMinBuildingAge() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("buildingAge"), filters.getMinBuildingAge()));
        }
        if (filters.getMaxBuildingAge() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("buildingAge"), filters.getMaxBuildingAge()));
        }
        
        // Boolean filters
        if (filters.isFurnished()) {
            predicates.add(cb.equal(root.get("furnished"), true));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<RealEstateListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "squaremeters", "square_meters" -> Optional.of(root.get("squareMeters"));
            case "roomcount", "room_count" -> Optional.of(root.get("roomCount"));
            case "buildingage", "building_age" -> Optional.of(root.get("buildingAge"));
            default -> Optional.empty();
        };
    }
}

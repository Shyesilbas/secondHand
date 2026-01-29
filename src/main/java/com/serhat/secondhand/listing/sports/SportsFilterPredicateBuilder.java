package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.listing.application.FilterPredicateBuilder;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
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
public class SportsFilterPredicateBuilder implements FilterPredicateBuilder<SportsListing, SportsListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<SportsListing> root, SportsListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        predicates.add(cb.equal(root.get("listingType"), ListingType.SPORTS));
        
        if (filters.getDisciplineIds() != null && !filters.getDisciplineIds().isEmpty()) {
            predicates.add(root.join("discipline", JoinType.LEFT).get("id").in(filters.getDisciplineIds()));
        }
        
        if (filters.getEquipmentTypeIds() != null && !filters.getEquipmentTypeIds().isEmpty()) {
            predicates.add(root.join("equipmentType", JoinType.LEFT).get("id").in(filters.getEquipmentTypeIds()));
        }
        
        if (filters.getConditionIds() != null && !filters.getConditionIds().isEmpty()) {
            predicates.add(root.join("condition", JoinType.LEFT).get("id").in(filters.getConditionIds()));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<SportsListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "discipline" -> Optional.of(root.join("discipline", JoinType.LEFT).get("label"));
            case "equipmenttype", "equipment_type" -> Optional.of(root.join("equipmentType", JoinType.LEFT).get("label"));
            case "condition" -> Optional.of(root.join("condition", JoinType.LEFT).get("label"));
            default -> Optional.empty();
        };
    }
}

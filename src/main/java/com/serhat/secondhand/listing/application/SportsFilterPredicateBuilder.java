package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
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
public class SportsFilterPredicateBuilder implements FilterPredicateBuilder<SportsListing, SportsListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<SportsListing> root, SportsListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Listing type constraint
        predicates.add(cb.equal(root.get("listingType"), ListingType.SPORTS));
        
        // Sports-specific filters
        if (filters.getDisciplines() != null && !filters.getDisciplines().isEmpty()) {
            predicates.add(root.get("discipline").in(filters.getDisciplines()));
        }
        
        if (filters.getEquipmentTypes() != null && !filters.getEquipmentTypes().isEmpty()) {
            predicates.add(root.get("equipmentType").in(filters.getEquipmentTypes()));
        }
        
        if (filters.getConditions() != null && !filters.getConditions().isEmpty()) {
            predicates.add(root.get("condition").in(filters.getConditions()));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<SportsListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "discipline" -> Optional.of(root.get("discipline"));
            case "equipmenttype", "equipment_type" -> Optional.of(root.get("equipmentType"));
            case "condition" -> Optional.of(root.get("condition"));
            default -> Optional.empty();
        };
    }
}

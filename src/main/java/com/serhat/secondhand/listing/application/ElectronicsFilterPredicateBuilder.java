package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
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
public class ElectronicsFilterPredicateBuilder implements FilterPredicateBuilder<ElectronicListing, ElectronicListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<ElectronicListing> root, ElectronicListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Listing type constraint
        predicates.add(cb.equal(root.get("listingType"), ListingType.ELECTRONICS));
        
        // Electronics-specific filters
        if (filters.getElectronicTypes() != null && !filters.getElectronicTypes().isEmpty()) {
            predicates.add(root.get("electronicType").in(filters.getElectronicTypes()));
        }
        
        if (filters.getElectronicBrands() != null && !filters.getElectronicBrands().isEmpty()) {
            predicates.add(root.get("electronicBrand").in(filters.getElectronicBrands()));
        }
        
        if (filters.getColors() != null && !filters.getColors().isEmpty()) {
            predicates.add(root.get("color").in(filters.getColors()));
        }
        
        // Range filters
        if (filters.getMinYear() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filters.getMinYear()));
        }
        
        if (filters.getMaxYear() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("year"), filters.getMaxYear()));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<ElectronicListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "year" -> Optional.of(root.get("year"));
            case "brand" -> Optional.of(root.get("electronicBrand"));
            case "type" -> Optional.of(root.get("electronicType"));
            case "model" -> Optional.of(root.get("model"));
            default -> Optional.empty();
        };
    }
}

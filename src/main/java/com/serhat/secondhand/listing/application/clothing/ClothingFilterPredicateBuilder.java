package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.listing.application.FilterPredicateBuilder;
import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
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
public class ClothingFilterPredicateBuilder implements FilterPredicateBuilder<ClothingListing, ClothingListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<ClothingListing> root, ClothingListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Listing type constraint
        predicates.add(cb.equal(root.get("listingType"), ListingType.CLOTHING));
        
        // Clothing-specific filters
        if (filters.getBrands() != null && !filters.getBrands().isEmpty()) {
            predicates.add(root.get("brand").in(filters.getBrands()));
        }
        
        if (filters.getTypes() != null && !filters.getTypes().isEmpty()) {
            predicates.add(root.get("clothingType").in(filters.getTypes()));
        }
        
        if (filters.getColors() != null && !filters.getColors().isEmpty()) {
            predicates.add(root.get("color").in(filters.getColors()));
        }
        
        if (filters.getConditions() != null && !filters.getConditions().isEmpty()) {
            predicates.add(root.get("condition").in(filters.getConditions()));
        }
        
        if (filters.getClothingGenders() != null && !filters.getClothingGenders().isEmpty()) {
            predicates.add(root.get("clothingGender").in(filters.getClothingGenders()));
        }
        
        if (filters.getClothingCategories() != null && !filters.getClothingCategories().isEmpty()) {
            predicates.add(root.get("clothingCategory").in(filters.getClothingCategories()));
        }
        
        // Date range filters
        if (filters.getMinPurchaseDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), filters.getMinPurchaseDate()));
        }
        
        if (filters.getMaxPurchaseDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), filters.getMaxPurchaseDate()));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<ClothingListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "brand" -> Optional.of(root.get("brand"));
            case "type" -> Optional.of(root.get("clothingType"));
            case "condition" -> Optional.of(root.get("condition"));
            case "clothingGender" -> Optional.of(root.get("clothingGender"));
            case "clothingCategory" -> Optional.of(root.get("clothingCategory"));
            case "purchasedate", "purchase_date" -> Optional.of(root.get("purchaseDate"));
            default -> Optional.empty();
        };
    }
}

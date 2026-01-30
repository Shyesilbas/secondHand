package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.listing.application.FilterPredicateBuilder;
import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Locale;

@Component
public class ClothingFilterPredicateBuilder implements FilterPredicateBuilder<ClothingListing, ClothingListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<ClothingListing> root, ClothingListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

        predicates.add(cb.equal(root.get("listingType"), ListingType.CLOTHING));

        if (filters.getBrands() != null && !filters.getBrands().isEmpty()) {
            Join<Object, Object> brandJoin = root.join("brand");
            predicates.add(brandJoin.get("id").in(filters.getBrands()));
        }
        
        if (filters.getTypes() != null && !filters.getTypes().isEmpty()) {
            Join<Object, Object> typeJoin = root.join("clothingType");
            predicates.add(typeJoin.get("id").in(filters.getTypes()));
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

        if (filters.getMinPurchaseDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), filters.getMinPurchaseDate()));
        }
        
        if (filters.getMaxPurchaseDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), filters.getMaxPurchaseDate()));
        }

        if (filters.getSizes() != null && !filters.getSizes().isEmpty()) {
            predicates.add(root.get("size").in(filters.getSizes()));
        }

        if (filters.getMinShoeSizeEu() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("shoeSizeEu"), filters.getMinShoeSizeEu()));
        }

        if (filters.getMaxShoeSizeEu() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("shoeSizeEu"), filters.getMaxShoeSizeEu()));
        }

        if (filters.getMaterial() != null && !filters.getMaterial().isBlank()) {
            String q = "%" + filters.getMaterial().trim().toLowerCase(Locale.ROOT) + "%";
            predicates.add(cb.like(cb.lower(root.get("material")), q));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<ClothingListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "brand" -> Optional.of(root.join("brand").get("label"));
            case "type" -> Optional.of(root.join("clothingType").get("label"));
            case "condition" -> Optional.of(root.get("condition"));
            case "clothingGender" -> Optional.of(root.get("clothingGender"));
            case "clothingCategory" -> Optional.of(root.get("clothingCategory"));
            case "purchasedate", "purchase_date" -> Optional.of(root.get("purchaseDate"));
            default -> Optional.empty();
        };
    }
}

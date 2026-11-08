package com.serhat.secondhand.listing.application.realestate;

import com.serhat.secondhand.listing.application.filter.FilterPredicateBuilder;
import com.serhat.secondhand.listing.application.filter.ListingAttributePredicates;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class RealEstateFilterPredicateBuilder implements FilterPredicateBuilder<RealEstateListing, RealEstateFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<RealEstateListing> root, RealEstateFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

        predicates.add(cb.equal(root.get("listingType"), ListingType.REAL_ESTATE));

        if (notEmpty(filters.getHeatingTypeIds())) {
            predicates.add(root.join("heatingType").get("id").in(filters.getHeatingTypeIds()));
        }
        if (notEmpty(filters.getRealEstateTypeIds())) {
            predicates.add(root.join("realEstateType").get("id").in(filters.getRealEstateTypeIds()));
        }
        if (filters.getAdTypeId() != null) {
            predicates.add(cb.equal(root.join("adType").get("id"), filters.getAdTypeId()));
        }
        if (filters.getOwnerTypeId() != null) {
            predicates.add(cb.equal(root.join("ownerType").get("id"), filters.getOwnerTypeId()));
        }

        range(cb, predicates, root.<Integer>get("grossAreaM2"), filters.getMinGrossArea(), filters.getMaxGrossArea());
        range(cb, predicates, root.<Integer>get("netAreaM2"), filters.getMinNetArea(), filters.getMaxNetArea());
        range(cb, predicates, root.<Integer>get("roomCount"), filters.getMinRoomCount(), filters.getMaxRoomCount());
        range(cb, predicates, root.<Integer>get("floorNumber"), filters.getMinFloor(), filters.getMaxFloor());
        range(cb, predicates, root.<Integer>get("buildingAge"), filters.getMinBuildingAge(), filters.getMaxBuildingAge());

        if (notEmpty(filters.getRoomConfigKeys())) {
            predicates.add(root.get("roomConfigKey").in(filters.getRoomConfigKeys()));
        }
        if (notEmpty(filters.getZoningStatusKeys())) {
            predicates.add(root.get("zoningStatusKey").in(filters.getZoningStatusKeys()));
        }
        if (filters.isFurnished()) {
            predicates.add(cb.isTrue(root.<Boolean>get("furnished")));
        }
        if (filters.isHasElevator()) {
            predicates.add(cb.isTrue(root.<Boolean>get("hasElevator")));
        }
        if (filters.isHasParking()) {
            predicates.add(cb.isTrue(root.<Boolean>get("hasParking")));
        }
        if (filters.isInSite()) {
            predicates.add(cb.isTrue(root.<Boolean>get("inSite")));
        }

        if (notEmpty(filters.getDeedStatuses())) {
            predicates.add(ListingAttributePredicates.textIn(cb, root.get("attributes"), "deedStatus", filters.getDeedStatuses()));
        }
        if (filters.getLoanEligible() != null) {
            predicates.add(ListingAttributePredicates.booleanEquals(cb, root.get("attributes"), "loanEligible", filters.getLoanEligible()));
        }

        return predicates;
    }

    private static void range(CriteriaBuilder cb, List<Predicate> predicates, Expression<Integer> field, Integer min, Integer max) {
        if (min != null) {
            predicates.add(cb.greaterThanOrEqualTo(field, min));
        }
        if (max != null) {
            predicates.add(cb.lessThanOrEqualTo(field, max));
        }
    }

    private static boolean notEmpty(Collection<?> values) {
        return values != null && !values.isEmpty();
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<RealEstateListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "grossarea", "gross_area", "squaremeters", "square_meters" -> Optional.of(root.get("grossAreaM2"));
            case "roomcount", "room_count" -> Optional.of(root.get("roomCount"));
            case "buildingage", "building_age" -> Optional.of(root.get("buildingAge"));
            case "floor", "floornumber" -> Optional.of(root.get("floorNumber"));
            default -> Optional.empty();
        };
    }
}

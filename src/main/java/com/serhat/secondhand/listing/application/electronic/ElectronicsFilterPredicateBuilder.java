package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.listing.application.FilterPredicateBuilder;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
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

@Component
public class ElectronicsFilterPredicateBuilder implements FilterPredicateBuilder<ElectronicListing, ElectronicListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<ElectronicListing> root, ElectronicListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Listing type constraint
        predicates.add(cb.equal(root.get("listingType"), ListingType.ELECTRONICS));
        
        // Electronics-specific filters
        if (filters.getElectronicTypeIds() != null && !filters.getElectronicTypeIds().isEmpty()) {
            Join<Object, Object> typeJoin = root.join("electronicType");
            predicates.add(typeJoin.get("id").in(filters.getElectronicTypeIds()));
        }
        
        if (filters.getElectronicBrandIds() != null && !filters.getElectronicBrandIds().isEmpty()) {
            Join<Object, Object> brandJoin = root.join("electronicBrand");
            predicates.add(brandJoin.get("id").in(filters.getElectronicBrandIds()));
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

        if (filters.getMinRam() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("ram"), filters.getMinRam()));
        }
        if (filters.getMaxRam() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("ram"), filters.getMaxRam()));
        }
        if (filters.getMinStorage() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("storage"), filters.getMinStorage()));
        }
        if (filters.getMaxStorage() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("storage"), filters.getMaxStorage()));
        }
        if (filters.getStorageTypes() != null && !filters.getStorageTypes().isEmpty()) {
            predicates.add(root.get("storageType").in(filters.getStorageTypes()));
        }
        if (filters.getProcessors() != null && !filters.getProcessors().isEmpty()) {
            predicates.add(root.get("processor").in(filters.getProcessors()));
        }
        if (filters.getMinScreenSize() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("screenSize"), filters.getMinScreenSize()));
        }
        if (filters.getMaxScreenSize() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("screenSize"), filters.getMaxScreenSize()));
        }

        if (filters.getMinBatteryHealthPercent() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("batteryHealthPercent"), filters.getMinBatteryHealthPercent()));
        }
        if (filters.getMaxBatteryHealthPercent() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("batteryHealthPercent"), filters.getMaxBatteryHealthPercent()));
        }
        if (filters.getMinBatteryCapacityMah() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("batteryCapacityMah"), filters.getMinBatteryCapacityMah()));
        }
        if (filters.getMaxBatteryCapacityMah() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("batteryCapacityMah"), filters.getMaxBatteryCapacityMah()));
        }
        if (filters.getMinCameraMegapixels() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("cameraMegapixels"), filters.getMinCameraMegapixels()));
        }
        if (filters.getMaxCameraMegapixels() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("cameraMegapixels"), filters.getMaxCameraMegapixels()));
        }

        if (filters.getSupports5g() != null) {
            predicates.add(cb.equal(root.get("supports5g"), filters.getSupports5g()));
        }
        if (filters.getDualSim() != null) {
            predicates.add(cb.equal(root.get("dualSim"), filters.getDualSim()));
        }
        if (filters.getHasNfc() != null) {
            predicates.add(cb.equal(root.get("hasNfc"), filters.getHasNfc()));
        }

        if (filters.getConnectionTypes() != null && !filters.getConnectionTypes().isEmpty()) {
            predicates.add(root.get("connectionType").in(filters.getConnectionTypes()));
        }
        if (filters.getWireless() != null) {
            predicates.add(cb.equal(root.get("wireless"), filters.getWireless()));
        }
        if (filters.getNoiseCancelling() != null) {
            predicates.add(cb.equal(root.get("noiseCancelling"), filters.getNoiseCancelling()));
        }
        if (filters.getHasMicrophone() != null) {
            predicates.add(cb.equal(root.get("hasMicrophone"), filters.getHasMicrophone()));
        }
        if (filters.getMinBatteryLifeHours() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("batteryLifeHours"), filters.getMinBatteryLifeHours()));
        }
        if (filters.getMaxBatteryLifeHours() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("batteryLifeHours"), filters.getMaxBatteryLifeHours()));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<ElectronicListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "year" -> Optional.of(root.get("year"));
            case "brand" -> Optional.of(root.join("electronicBrand").get("label"));
            case "type" -> Optional.of(root.join("electronicType").get("label"));
            case "model" -> Optional.of(root.join("model").get("name"));
            default -> Optional.empty();
        };
    }
}

package com.serhat.secondhand.listing.validation.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

/**
 * Applies the selected property type's rules (data/realestate/realestate.json): REQUIRED fields must be set,
 * HIDDEN fields are cleared, numbers must be positive and spec keys must exist in data/realestate/specs.json.
 * Also derives the room count from the room plan and the floor number from the floor, and drops the attribute
 * answers that belong to the other ad type (deposit and lease term only for rent, loan eligibility only for sale).
 */
@Component
@RequiredArgsConstructor
public class RealEstateTypeRulesValidator implements RealEstateSpecValidator {

    static final String FOR_SALE = "FOR_SALE";
    static final String FOR_RENT = "FOR_RENT";
    private static final Set<String> RENT_ONLY_ATTRIBUTES = Set.of("deposit", "minLeaseMonths");
    private static final Set<String> SALE_ONLY_ATTRIBUTES = Set.of("loanEligible");
    private static final int MAX_BUILDING_AGE = 200;

    private final RealEstateSpecCatalogService specCatalog;

    @Override
    public Result<Void> validate(RealEstateListing listing) {
        RealEstateType type = listing == null ? null : listing.getRealEstateType();
        if (type == null) {
            return Result.success();
        }
        Map<String, SpecFieldRule> rules = type.getFieldRules();
        if (rules == null || rules.isEmpty()) {
            return Result.error("Real estate type " + type.getName() + " has no field rules; run the realestate seed",
                    "REAL_ESTATE_TYPE_RULES_MISSING");
        }
        for (RealEstateSpecFields.Field field : RealEstateSpecFields.ALL.values()) {
            if (field.toggle()) {
                continue;
            }
            Object value = field.getter().apply(listing);
            if (value instanceof String text && text.isBlank()) {
                value = null;
            }
            if (rules.get(field.name()) == SpecFieldRule.REQUIRED && value == null) {
                return Result.error(field.label() + " is required for " + type.getLabel() + " listings", field.errorCode());
            }
        }

        Result<Void> numbers = checkNumbers(listing);
        if (numbers.isError()) {
            return numbers;
        }
        if (listing.getRoomConfigKey() != null && !specCatalog.isValidRoomConfig(listing.getRoomConfigKey())) {
            return Result.error("Unknown room plan: " + listing.getRoomConfigKey(), "INVALID_ROOM_CONFIG_KEY");
        }
        if (listing.getZoningStatusKey() != null && !specCatalog.isValidZoningStatus(listing.getZoningStatusKey())) {
            return Result.error("Unknown zoning status: " + listing.getZoningStatusKey(), "INVALID_ZONING_STATUS_KEY");
        }
        if (listing.getInfrastructureStatusKey() != null
                && !specCatalog.isValidInfrastructureStatus(listing.getInfrastructureStatusKey())) {
            return Result.error("Unknown infrastructure status: " + listing.getInfrastructureStatusKey(),
                    "INVALID_INFRASTRUCTURE_STATUS_KEY");
        }
        if (listing.getFloorKey() != null && specCatalog.findFloor(listing.getFloorKey()).isEmpty()) {
            return Result.error("Unknown floor: " + listing.getFloorKey(), "INVALID_FLOOR_KEY");
        }
        if (listing.getFloorNumber() != null && listing.getTotalFloors() != null
                && listing.getFloorNumber() > listing.getTotalFloors()) {
            return Result.error("Floor cannot be above the building's total floors", "REAL_ESTATE_FLOOR_ABOVE_TOTAL");
        }
        if (listing.getNetAreaM2() != null && listing.getGrossAreaM2() != null
                && listing.getNetAreaM2() > listing.getGrossAreaM2()) {
            return Result.error("Net area cannot be larger than the gross area", "REAL_ESTATE_NET_AREA_ABOVE_GROSS");
        }
        return Result.success();
    }

    @Override
    public void cleanup(RealEstateListing listing) {
        if (listing == null) {
            return;
        }
        for (RealEstateSpecFields.Field field : RealEstateSpecFields.ALL.values()) {
            if (field.getter().apply(listing) instanceof String text && text.isBlank()) {
                field.clearer().accept(listing);
            }
        }
        RealEstateType type = listing.getRealEstateType();
        if (type != null && type.getFieldRules() != null && !type.getFieldRules().isEmpty()) {
            for (RealEstateSpecFields.Field field : RealEstateSpecFields.ALL.values()) {
                // A field the rules do not name counts as HIDDEN, as in the form.
                SpecFieldRule rule = type.getFieldRules().get(field.name());
                if (rule == null || rule == SpecFieldRule.HIDDEN) {
                    field.clearer().accept(listing);
                }
            }
        }
        if (!listing.isInSite()) {
            listing.setSiteName(null);
        }
        listing.setRoomCount(specCatalog.findRoomConfig(listing.getRoomConfigKey())
                .map(RealEstateSpecCatalogService.SpecDto::getRooms)
                .orElse(null));
        listing.setFloorNumber(floorNumber(listing));
        dropOtherAdTypeAttributes(listing);
    }

    private Integer floorNumber(RealEstateListing listing) {
        String key = listing.getFloorKey();
        if (key == null || key.isBlank()) {
            return null;
        }
        if ("ROOF".equals(key)) {
            return listing.getTotalFloors();
        }
        return specCatalog.findFloor(key).map(RealEstateSpecCatalogService.SpecDto::getNumber).orElse(null);
    }

    private void dropOtherAdTypeAttributes(RealEstateListing listing) {
        RealEstateAdType adType = listing.getAdType();
        if (adType == null || listing.getAttributes() == null) {
            return;
        }
        if (!FOR_RENT.equals(adType.getName())) {
            RENT_ONLY_ATTRIBUTES.forEach(listing.getAttributes()::remove);
        }
        if (!FOR_SALE.equals(adType.getName())) {
            SALE_ONLY_ATTRIBUTES.forEach(listing.getAttributes()::remove);
        }
    }

    private Result<Void> checkNumbers(RealEstateListing l) {
        if (!positive(l.getGrossAreaM2()) || !positive(l.getNetAreaM2()) || !positive(l.getGardenAreaM2())
                || !positive(l.getLandShareM2()) || !positive(l.getTotalFloors())) {
            return Result.error("Areas and total floors must be greater than 0", "REAL_ESTATE_SPEC_VALUE_INVALID");
        }
        if ((l.getBathroomCount() != null && l.getBathroomCount() < 0)
                || (l.getBuildingAge() != null && (l.getBuildingAge() < 0 || l.getBuildingAge() > MAX_BUILDING_AGE))) {
            return Result.error("Bathroom count must be 0 or more and building age between 0 and " + MAX_BUILDING_AGE,
                    "REAL_ESTATE_SPEC_VALUE_INVALID");
        }
        if (!positive(l.getFloorAreaRatio()) || !positive(l.getHeightLimit()) || !positive(l.getRoadFrontage())
                || (l.getMonthlyFee() != null && l.getMonthlyFee().signum() < 0)) {
            return Result.error("Zoning values must be greater than 0 and the monthly fee 0 or more",
                    "REAL_ESTATE_SPEC_VALUE_INVALID");
        }
        return Result.success();
    }

    private static boolean positive(Integer v) {
        return v == null || v > 0;
    }

    private static boolean positive(BigDecimal v) {
        return v == null || v.signum() > 0;
    }
}

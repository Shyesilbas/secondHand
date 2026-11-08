package com.serhat.secondhand.listing.validation.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Applies the selected vehicle type's rules (data/vehicles/types.json): REQUIRED fields must be set,
 * HIDDEN fields are cleared, and the body type must be one the type allows.
 */
@Component
public class VehicleTypeRulesValidator implements VehicleSpecValidator {

    @Override
    public Result<Void> validate(VehicleListing listing) {
        VehicleType type = listing == null ? null : listing.getVehicleType();
        if (type == null) {
            return Result.success();
        }
        Map<String, SpecFieldRule> rules = type.getFieldRules();
        if (rules == null || rules.isEmpty()) {
            return Result.error("Vehicle type " + type.getName() + " has no field rules; run the vehicle seed",
                    "VEHICLE_TYPE_RULES_MISSING");
        }

        for (VehicleSpecFields.Field field : VehicleSpecFields.ALL.values()) {
            if (rules.get(field.name()) != SpecFieldRule.REQUIRED) {
                continue;
            }
            Object value = field.getter().apply(listing);
            if (value == null || (value instanceof Integer number && !isValidRequiredNumber(field.name(), number))) {
                return Result.error(field.label() + " is required for " + type.getLabel() + " listings",
                        field.errorCode());
            }
        }

        if (listing.getBodyType() != null
                && (type.getBodyTypes() == null || !type.getBodyTypes().contains(listing.getBodyType()))) {
            return Result.error("Body type " + listing.getBodyType().getLabel() + " is not allowed for "
                    + type.getLabel() + " listings", "VEHICLE_BODY_TYPE_NOT_ALLOWED");
        }
        return Result.success();
    }

    @Override
    public void cleanup(VehicleListing listing) {
        if (listing == null) {
            return;
        }
        if (listing.getWheels() != null && listing.getWheels() <= 0) {
            listing.setWheels(null);
        }
        VehicleType type = listing.getVehicleType();
        if (type == null || type.getFieldRules() == null || type.getFieldRules().isEmpty()) {
            return;
        }
        for (VehicleSpecFields.Field field : VehicleSpecFields.ALL.values()) {
            // A field the rules do not name counts as HIDDEN, as in the form.
            SpecFieldRule rule = type.getFieldRules().get(field.name());
            if (rule == null || rule == SpecFieldRule.HIDDEN) {
                field.clearer().accept(listing);
            }
        }
    }

    /** Mileage may be 0 (a new vehicle); every other required number must be positive. */
    private static boolean isValidRequiredNumber(String fieldName, int value) {
        return "mileage".equals(fieldName) ? value >= 0 : value > 0;
    }
}

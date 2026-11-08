package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.Map;

/**
 * Applies the selected electronic type's rules (data/electronics/types.json): REQUIRED fields must be set,
 * HIDDEN fields are cleared, numbers must be positive. Also the checks that hold for every type: a plausible year,
 * and an origin when warranty proof is claimed.
 */
@Component
public class ElectronicTypeRulesValidator implements ElectronicSpecValidator {

    private static final int MIN_YEAR = 1990;

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        ElectronicType type = listing == null ? null : listing.getElectronicType();
        if (type == null) {
            return Result.success();
        }
        Map<String, SpecFieldRule> rules = type.getFieldRules();
        if (rules == null || rules.isEmpty()) {
            return Result.error("Electronic type " + type.getName() + " has no field rules; run the electronics seed",
                    "ELECTRONIC_TYPE_RULES_MISSING");
        }
        for (ElectronicSpecFields.Field field : ElectronicSpecFields.ALL.values()) {
            Object value = field.getter().apply(listing);
            if (value instanceof Integer number && number <= 0) {
                return Result.error(field.label() + " must be greater than 0", "ELECTRONIC_SPEC_VALUE_INVALID");
            }
            if (value instanceof String text && text.isBlank()) {
                value = null;
            }
            if (rules.get(field.name()) == SpecFieldRule.REQUIRED && value == null) {
                return Result.error(field.label() + " is required for " + type.getLabel() + " listings",
                        field.errorCode());
            }
        }
        Integer year = listing.getYear();
        if (year != null && (year < MIN_YEAR || year > Year.now().getValue() + 1)) {
            return Result.error("Year must be between " + MIN_YEAR + " and next year", "ELECTRONIC_YEAR_INVALID");
        }
        if (listing.isWarrantyProof() && (listing.getOrigin() == null || listing.getOrigin().isBlank())) {
            return Result.error("Origin is required when warranty proof is provided", "ELECTRONIC_ORIGIN_REQUIRED");
        }
        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (listing == null) {
            return;
        }
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getFieldRules() == null || type.getFieldRules().isEmpty()) {
            return;
        }
        for (ElectronicSpecFields.Field field : ElectronicSpecFields.ALL.values()) {
            // A field the rules do not name counts as HIDDEN, as in the form.
            SpecFieldRule rule = type.getFieldRules().get(field.name());
            if (rule == null || rule == SpecFieldRule.HIDDEN) {
                field.clearer().accept(listing);
            }
        }
        // Wireless follows the connection type when the seller did not say.
        if (listing.getWireless() == null && listing.getConnectionType() != null
                && type.getFieldRules().getOrDefault("wireless", SpecFieldRule.HIDDEN) != SpecFieldRule.HIDDEN) {
            ElectronicConnectionType ct = listing.getConnectionType();
            listing.setWireless(ct == ElectronicConnectionType.BLUETOOTH || ct == ElectronicConnectionType.BOTH);
        }
    }
}
